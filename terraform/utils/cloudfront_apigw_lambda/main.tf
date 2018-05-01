# Based on: https://www.terraform.io/docs/providers/aws/guides/serverless-with-aws-lambda-and-api-gateway.html
# See also: https://github.com/hashicorp/terraform/issues/10157
# See also: https://github.com/carrot/terraform-api-gateway-cors-module/

# https://www.terraform.io/docs/providers/aws/r/lambda_function.html
resource "aws_lambda_function" "this" {
  function_name    = "${var.cloudfront_apigw_cloudfront_function_name}"
  filename         = "${var.cloudfront_apigw_cloudfront_function_filename}"
  source_code_hash = "${base64sha256(file("${var.cloudfront_apigw_cloudfront_function_filename}"))}"
  handler          = "${var.cloudfront_apigw_cloudfront_function_handler}"
  runtime          = "${var.cloudfront_apigw_cloudfront_function_runtime}"
  role             = "${aws_iam_role.this.arn}"

  environment {
    variables = "${var.cloudfront_apigw_cloudfront_function_env_vars}"
  }
}

# Configure an API Gateway instance:

resource "aws_api_gateway_rest_api" "this" {
  name = "${var.cloudfront_apigw_cloudfront_function_name}"
}

# Add root resource to the API (it it needs to be included separately from the "proxy" resource defined below), which forwards to our Lambda:

resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = "${aws_api_gateway_rest_api.this.id}"
  resource_id   = "${aws_api_gateway_rest_api.this.root_resource_id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "proxy_root" {
  rest_api_id             = "${aws_api_gateway_rest_api.this.id}"
  resource_id             = "${aws_api_gateway_method.proxy_root.resource_id}"
  http_method             = "${aws_api_gateway_method.proxy_root.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.this.invoke_arn}"
}

# Add a "proxy" resource, that matches all paths (except the root, defined above) and forwards them to our Lambda:

resource "aws_api_gateway_resource" "proxy_other" {
  rest_api_id = "${aws_api_gateway_rest_api.this.id}"
  parent_id   = "${aws_api_gateway_rest_api.this.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy_other" {
  rest_api_id   = "${aws_api_gateway_rest_api.this.id}"
  resource_id   = "${aws_api_gateway_resource.proxy_other.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "proxy_other" {
  rest_api_id             = "${aws_api_gateway_rest_api.this.id}"
  resource_id             = "${aws_api_gateway_method.proxy_other.resource_id}"
  http_method             = "${aws_api_gateway_method.proxy_other.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.this.invoke_arn}"
}

resource "aws_api_gateway_method_response" "proxy_other" {
  rest_api_id = "${aws_api_gateway_rest_api.this.id}"
  resource_id = "${aws_api_gateway_resource.proxy_other.id}"
  http_method = "${aws_api_gateway_method.proxy_other.http_method}"
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "proxy_other" {
  depends_on  = ["aws_api_gateway_integration.proxy_other"]
  rest_api_id = "${aws_api_gateway_rest_api.this.id}"
  resource_id = "${aws_api_gateway_resource.proxy_other.id}"
  http_method = "${aws_api_gateway_method.proxy_other.http_method}"
  status_code = "${aws_api_gateway_method_response.proxy_other.status_code}"

  response_templates = {
    "application/json" = ""
  }
}

# Allow responding to OPTIONS requests for CORS clients with a MOCK endpoint:

resource "aws_api_gateway_method" "proxy_cors" {
  rest_api_id   = "${aws_api_gateway_rest_api.this.id}"
  resource_id   = "${aws_api_gateway_resource.proxy_other.id}"
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "proxy_cors" {
  rest_api_id = "${aws_api_gateway_rest_api.this.id}"
  resource_id = "${aws_api_gateway_resource.proxy_other.id}"
  http_method = "${aws_api_gateway_method.proxy_cors.http_method}"
  type        = "MOCK"

  request_templates = {
    "application/json" = <<EOF
{ "statusCode": 200 }
EOF
  }
}

resource "aws_api_gateway_integration_response" "proxy_cors" {
  depends_on  = ["aws_api_gateway_integration.proxy_cors"]
  rest_api_id = "${aws_api_gateway_rest_api.this.id}"
  resource_id = "${aws_api_gateway_resource.proxy_other.id}"
  http_method = "${aws_api_gateway_method.proxy_cors.http_method}"
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS,GET,PUT,PATCH,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_method_response" "proxy_cors" {
  depends_on  = ["aws_api_gateway_method.proxy_cors"]
  rest_api_id = "${aws_api_gateway_rest_api.this.id}"
  resource_id = "${aws_api_gateway_resource.proxy_other.id}"
  http_method = "OPTIONS"
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = "${aws_api_gateway_rest_api.this.id}"
  stage_name  = "${var.cloudfront_apigw_cloudfront_stage_name}"

  depends_on = [
    "aws_api_gateway_integration.proxy_root",
    "aws_api_gateway_integration.proxy_other",
    "aws_api_gateway_integration.proxy_cors",
  ]
}

# Add necessary permissions for reading events from API Gateway, and writing logs to CloudWatch:

resource "aws_iam_role" "this" {
  name = "AllowLambdaExec"

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

resource "aws_lambda_permission" "this" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.this.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_deployment.this.execution_arn}/*/*" # the /*/* portion grants access from any method on any resource within the API Gateway "REST API"
}

# https://github.com/terraform-providers/terraform-provider-aws/issues/2237
resource "aws_iam_policy" "this" {
  name = "${var.cloudfront_apigw_cloudfront_function_name}"
  path = "/"

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

resource "aws_iam_role_policy_attachment" "this" {
  role       = "${aws_iam_role.this.name}"
  policy_arn = "${aws_iam_policy.this.arn}"
}

# https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = ""
  aliases             = ["${var.cloudfront_apigw_lambda_domain_name}"]
  price_class         = "PriceClass_100"

  origin {
    # Sadly, the aws_api_gateway_deployment resource doesn't export this value on its own
    # e.g. "https://abcdefg.execute-api.eu-central-1.amazonaws.com/default" => "abcdefg.execute-api.eu-central-1.amazonaws.com"
    domain_name = "${replace(aws_api_gateway_deployment.this.invoke_url, "/^.*\\/\\/(.*)\\/.*$/", "$1")}"

    origin_id   = "${var.cloudfront_apigw_cloudfront_function_name}"
    origin_path = "/${var.cloudfront_apigw_cloudfront_stage_name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.cloudfront_apigw_cloudfront_function_name}"
    viewer_protocol_policy = "allow-all"

    # TODO: https://github.com/terraform-providers/terraform-provider-aws/issues/1994
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html#viewer-certificate-arguments
  viewer_certificate {
    acm_certificate_arn      = "${aws_acm_certificate_validation.this.certificate_arn}"
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.1_2016"
  }
}

# https://www.terraform.io/docs/providers/aws/r/acm_certificate.html
resource "aws_acm_certificate" "this" {
  provider          = "aws.acm_provider"                           # because ACM needs to be used in the "us-east-1" region
  domain_name       = "${var.cloudfront_apigw_lambda_domain_name}"
  validation_method = "DNS"
}

resource "aws_route53_record" "cert_validation" {
  name = "${aws_acm_certificate.this.domain_validation_options.0.resource_record_name}"
  type = "${aws_acm_certificate.this.domain_validation_options.0.resource_record_type}"

  zone_id = "${var.cloudfront_apigw_lambda_domain_zone}"
  records = ["${aws_acm_certificate.this.domain_validation_options.0.resource_record_value}"]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "this" {
  provider                = "aws.acm_provider"                             # because ACM needs to be used in the "us-east-1" region
  certificate_arn         = "${aws_acm_certificate.this.arn}"
  validation_record_fqdns = ["${aws_route53_record.cert_validation.fqdn}"]
}

resource "aws_route53_record" "this" {
  zone_id = "${var.cloudfront_apigw_lambda_domain_zone}"
  name    = "${var.cloudfront_apigw_lambda_domain_name}"

  type = "A"

  alias {
    name                   = "${aws_cloudfront_distribution.this.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.this.hosted_zone_id}"
    evaluate_target_health = false
  }
}
