# NOTE: The reason why "colored" CloudFront proxies exist is because it's where SSL termination happens.
# Without SSL, Couch won't replicate, for example.

module "hosting_db_prod" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_reverse_proxy#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v11.0...master
  source    = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_reverse_proxy?ref=v11.0"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix        = ""
  site_domain        = "db-prod-blue.nightbear.fi"
  origin_url         = "http://${aws_route53_record.this.name}/"
  origin_custom_port = "${local.port_map["db-prod"]}"

  tags = {
    Nightbear_Component   = "db"
    Nightbear_Environment = "prod"
  }
}

module "hosting_db_stage" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_reverse_proxy#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v11.0...master
  source    = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_reverse_proxy?ref=v11.0"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix        = ""
  site_domain        = "db-stage-blue.nightbear.fi"
  origin_url         = "http://${aws_route53_record.this.name}/"
  origin_custom_port = "${local.port_map["db-stage"]}"

  tags = {
    Nightbear_Component   = "db"
    Nightbear_Environment = "stage"
  }
}

module "hosting_legacy" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_reverse_proxy#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v11.0...master
  source    = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_reverse_proxy?ref=v11.0"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix        = ""
  site_domain        = "legacy.nightbear.fi"
  origin_url         = "http://${aws_route53_record.this.name}/"
  origin_custom_port = "${local.port_map["legacy"]}"

  viewer_https_only    = false # for legacy integrations that won't/can't do HTTPS
  cache_ttl_override   = 0     # our old server may sometimes omit sensible cache-control headers
  add_response_headers = {}    # skip adding HSTS by default

  tags = {
    Nightbear_Component   = "legacy"
    Nightbear_Environment = "prod"
  }
}
