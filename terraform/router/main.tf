module "router" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_lambda_api#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v9.4...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_lambda_api?ref=v9.4"

  api_domain             = "router.nightbear.fi"
  function_zipfile       = "${path.module}/lambda-multicast-proxy-v1.2.1.zip" # https://github.com/jareware/lambda-multicast-proxy
  lambda_logging_enabled = true                                               # note that this only includes messages from the runtime (e.g. start & stop); the JS code logs directly to Papertrail
  https_only             = false                                              # the router receives data from IoT devices incapable of HTTPS
  function_runtime       = "nodejs12.x"

  function_env_vars = {
    LAMBDA_MULTICAST_CONFIG = "${replace(file("${path.module}/lambda-multicast-proxy-config.json"), "/\\n/", "")}" # Lambda won't like newlines in env vars, so strip them out
  }

  tags = {
    Nightbear_Component   = "router"
    Nightbear_Environment = "mixed"
  }
}
