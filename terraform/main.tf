resource "aws_route53_zone" "main" {
  name = "nightbear.fi"
}

module "mailgun_domain" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_mailgun_domain#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v9.4...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_mailgun_domain?ref=v9.4"

  mail_domain   = "nightbear.fi"
  smtp_password = "${var.mailgun_smtp_password}"
}

module "metrics" {
  source = "./metrics"
}

module "router" {
  source = "./router"
}

module "ui_stage" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_static_site#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v9.4...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_static_site?ref=v9.4"

  site_domain = "stage.nightbear.fi"

  tags = {
    Nightbear_Component   = "ui"
    Nightbear_Environment = "stage"
  }
}

module "ui_prod" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_static_site#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v9.4...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_static_site?ref=v9.4"

  site_domain = "nightbear.fi"

  tags = {
    Nightbear_Component   = "ui"
    Nightbear_Environment = "prod"
  }
}

module "siren_ui" {
  source            = "./siren-ui"
  siren_ui_password = "${var.siren_ui_password}"
}

module "hosting" {
  source                 = "./shared-hosting"
  couchdb_admin_password = "${var.db_admin_password}"
  pushover_user          = "${var.pushover_user}"
  pushover_token         = "${var.pushover_token}"
  papertrail_host_legacy = "${var.papertrail_host_legacy}"
}
