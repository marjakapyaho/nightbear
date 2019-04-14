module "hosting_db_prod" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_reverse_proxy#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v11.0...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_reverse_proxy?ref=v11.0"

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
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_reverse_proxy?ref=v11.0"

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
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_reverse_proxy?ref=v11.0"

  name_prefix        = ""
  site_domain        = "legacy.nightbear.fi"
  origin_url         = "http://${aws_route53_record.this.name}/"
  origin_custom_port = "${local.port_map["legacy"]}"
  viewer_https_only  = false                                     # for legacy integrations

  tags = {
    Nightbear_Component   = "legacy"
    Nightbear_Environment = "prod"
  }
}
