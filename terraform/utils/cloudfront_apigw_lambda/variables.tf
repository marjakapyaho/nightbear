# Keep in mind wrt. CloudFront:
# https://aws.amazon.com/premiumsupport/knowledge-center/resolve-cnamealreadyexists-error/
variable "cloudfront_apigw_lambda_domain_name" {
  description = "Domain on which the Lambda will be made available (e.g. 'api.example.com')"
}

variable "cloudfront_apigw_lambda_domain_zone" {
  description = "Route 53 Zone ID on which to keep the DNS records"
}

variable "cloudfront_apigw_cloudfront_function_name" {
  description = "Name of the Lambda function; will be used in related contexts as a label as well (e.g. 'MyApiFunction')"
}

variable "cloudfront_apigw_cloudfront_function_filename" {
  description = "ZIP file that will be installed as the Lambda function (e.g. 'my-api.zip')"
}

variable "cloudfront_apigw_cloudfront_function_handler" {
  description = "Instructs Lambda on which function to invoke within the ZIP file"
  default     = "index.handler"
}

variable "cloudfront_apigw_cloudfront_function_runtime" {
  description = "Which node.js version should Lambda use for this function"
  default     = "nodejs6.10"
}

variable "cloudfront_apigw_cloudfront_function_env_vars" {
  description = "Which env vars (if any) to invoke the Lambda with"
  type        = "map"
  default     = {}
}

variable "cloudfront_apigw_cloudfront_stage_name" {
  description = "Name of the single stage created for the API" # we're not using the deployment features of API Gateway, so a single static stage is fine
  default     = "default"
}

# IMPORTANT! Due to the way API Gateway works, if the related config is ever is changed, you probably need to:
# $ terraform taint aws_api_gateway_deployment.this

