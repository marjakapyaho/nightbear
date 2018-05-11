# Based on: https://www.terraform.io/docs/providers/aws/guides/serverless-with-aws-lambda-and-api-gateway.html
# See also: https://github.com/hashicorp/terraform/issues/10157
# See also: https://github.com/carrot/terraform-api-gateway-cors-module/

# https://www.terraform.io/docs/providers/aws/r/lambda_function.html
resource "aws_lambda_function" "this" {
  function_name    = "${var.cloudfront_apigw_lambda_function_name}"
  filename         = "${var.cloudfront_apigw_lambda_function_filename}"
  source_code_hash = "${base64sha256(file("${var.cloudfront_apigw_lambda_function_filename}"))}"
  handler          = "${var.cloudfront_apigw_lambda_function_handler}"
  runtime          = "${var.cloudfront_apigw_lambda_function_runtime}"
  role             = "${aws_iam_role.this.arn}"

  environment {
    variables = "${var.cloudfront_apigw_lambda_function_env_vars}"
  }
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
