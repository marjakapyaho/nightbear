module "cloudfront_apigw_lambda" {
  source                                    = "../utils/cloudfront_apigw_lambda"
  cloudfront_apigw_lambda_function_name     = "NightbearRouter"
  cloudfront_apigw_lambda_domain_name       = "${var.router_domain_name}"
  cloudfront_apigw_lambda_function_filename = "${path.module}/lambda-multicast-proxy-1.0.1.zip" # https://github.com/jareware/lambda-multicast-proxy
  cloudfront_apigw_lambda_domain_zone       = "${var.router_domain_zone}"

  cloudfront_apigw_lambda_function_env_vars = {
    LAMBDA_MULTICAST_CONFIG = "${replace(file("${path.module}/lambda-multicast-proxy-config.json"), "/\\n/", "")}" # Lambda won't like newlines in env vars, so strip them out
  }
}
