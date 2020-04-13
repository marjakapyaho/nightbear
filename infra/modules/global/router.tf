module "router" {
  source    = "git::ssh://git@github.com/futurice/symptomradar.git//infra/modules/aws_lambda_api?ref=v2.1"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix      = "${var.name_prefix}-router"
  api_domain       = "router.nightbear.fi"
  function_zipfile = "${path.module}/lambda-multicast-proxy-v1.2.1.zip" # https://github.com/jareware/lambda-multicast-proxy
  tags             = merge(var.tags, { Component = "router" })

  function_env_vars = {
    LAMBDA_MULTICAST_CONFIG = jsonencode({
      logLevel           = "info"
      papertrailHost     = "TODO"
      papertrailPort     = 0 # TODO
      papertrailHostName = "nightbear-router"
      proxyTimeout       = 2500
      rewriteConfig = {
        # TODO
      }
      proxiedIncomingHeaders = [
        "authorization",
        "content-type",
        "user-agent",
        "x-request-id",
      ]
      proxiedOutgoingHeaders = [
        "content-type",
        "cache-control",
      ]
      additionalOutgoingHeaders = {
        Access-Control-Allow-Origin      = "*"
        Access-Control-Allow-Methods     = "GET, POST, OPTIONS"
        Access-Control-Allow-Headers     = "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
        Access-Control-Expose-Headers    = "Content-Length,Content-Range"
        Access-Control-Allow-Credentials = "true"
      }
    })
  }
}
