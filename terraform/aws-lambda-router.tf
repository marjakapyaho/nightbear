# Based on: https://www.terraform.io/docs/providers/aws/guides/serverless-with-aws-lambda-and-api-gateway.html

# https://www.terraform.io/docs/providers/aws/r/lambda_function.html
resource "aws_lambda_function" "router_function" {
  function_name    = "NightbearRouter"
  filename         = "aws-lambda-router.zip" # from: https://github.com/jareware/lambda-multicast-proxy
  source_code_hash = "${base64sha256(file("aws-lambda-router.zip"))}"
  handler          = "index.handler"
  runtime          = "nodejs6.10"
  role             = "${aws_iam_role.router_role.arn}"

  environment {
    variables = {
      LAMBDA_MULTICAST_CONFIG = "${replace(file("aws-lambda-router-config.json"), "/\\n/", "")}" # Lambda won't like newlines in env vars, so strip them out
    }
  }
}

# Add an output for invoking the Lambda through the API Gateway:

output "router_api_gw_invoke_url" {
  value = "${aws_api_gateway_deployment.router_deployment.invoke_url}"
}

# Configure an API Gateway in "proxy mode", so all requests are just relayed to our Lambda:

resource "aws_api_gateway_rest_api" "router_api" {
  name = "NightbearRouter"
}

resource "aws_api_gateway_resource" "router_proxy_resource" {
  rest_api_id = "${aws_api_gateway_rest_api.router_api.id}"
  parent_id   = "${aws_api_gateway_rest_api.router_api.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "router_proxy_method" {
  rest_api_id   = "${aws_api_gateway_rest_api.router_api.id}"
  resource_id   = "${aws_api_gateway_resource.router_proxy_resource.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "router_integration" {
  rest_api_id             = "${aws_api_gateway_rest_api.router_api.id}"
  resource_id             = "${aws_api_gateway_method.router_proxy_method.resource_id}"
  http_method             = "${aws_api_gateway_method.router_proxy_method.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.router_function.invoke_arn}"
}

# The proxy resource cannot match an empty path at the root of the API, so add separate config for that:

resource "aws_api_gateway_method" "router_proxy_method_root" {
  rest_api_id   = "${aws_api_gateway_rest_api.router_api.id}"
  resource_id   = "${aws_api_gateway_rest_api.router_api.root_resource_id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "router_integration_root" {
  rest_api_id             = "${aws_api_gateway_rest_api.router_api.id}"
  resource_id             = "${aws_api_gateway_method.router_proxy_method_root.resource_id}"
  http_method             = "${aws_api_gateway_method.router_proxy_method_root.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.router_function.invoke_arn}"
}

# We're not using the deployent features of API Gateway, so a single static stage is fine:

# IMPORTANT! Due to the way API Gateway works, if this config is ever is changed, you need to:
# $ terraform taint aws_api_gateway_deployment.router_deployment

resource "aws_api_gateway_deployment" "router_deployment" {
  rest_api_id = "${aws_api_gateway_rest_api.router_api.id}"
  stage_name  = "default"
  depends_on  = [
    "aws_api_gateway_integration.router_integration",
    "aws_api_gateway_integration.router_integration_root",
  ]
}

# Add necessary permissions for reading events from API Gateway, and writing logs to CloudTrail:

resource "aws_iam_role" "router_role" {
  name               = "AllowLambdaExec"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_permission" "router_api_gw_allow" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.router_function.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_deployment.router_deployment.execution_arn}/*/*" # the /*/* portion grants access from any method on any resource within the API Gateway "REST API"
}

# https://github.com/terraform-providers/terraform-provider-aws/issues/2237
resource "aws_iam_policy" "router_logging_allow" {
  name   = "NightbearRouterAllowLogging"
  path   = "/"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "router_logging_allow" {
  role       = "${aws_iam_role.router_role.name}"
  policy_arn = "${aws_iam_policy.router_logging_allow.arn}"
}
