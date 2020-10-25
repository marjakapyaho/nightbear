module "router" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_lambda_api#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v13.0...master
  source    = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_lambda_api?ref=v13.0"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix      = "${var.name_prefix}-router"
  api_domain       = "router.nightbear.fi"
  function_zipfile = "${path.module}/lambda-multicast-proxy-v1.2.1.zip" # https://github.com/jareware/lambda-multicast-proxy
  tags             = merge(var.tags, { Component = "router" })

  function_env_vars = {
    LAMBDA_MULTICAST_CONFIG = jsonencode({
      logLevel           = "info"
      papertrailHost     = split(":", var.secrets.papertrail_host_router)[0]
      papertrailPort     = tonumber(split(":", var.secrets.papertrail_host_router)[1])
      papertrailHostName = "nightbear-global-router"
      proxyTimeout       = 2500
      rewriteConfig = {
        "^/get-entries" = [
          "https://server.nightbear.fi/get-entries",
        ]
        "^/get-watch-status" = [
          "https://server.nightbear.fi/get-watch-status",
        ]
        "^/ack-latest-alarm" = [
          "https://server.nightbear.fi/ack-latest-alarm",
        ]
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
