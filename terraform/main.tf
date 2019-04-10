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

module "hosting_stage" {
  source = "./hosting"

  # These apply to all services running on the shared hosting:
  hosting_hostname        = "nightbear-hosting-stage"
  hosting_ssh_public_key  = "${file("terraform.id_rsa.pub")}"
  hosting_ssh_private_key = "${file("terraform.id_rsa")}"
  hosting_syslog_uri      = "${var.papertrail_host}"

  # These are server-specific:
  server_domain_name = "server-stage.nightbear.fi"
  server_domain_zone = "${aws_route53_zone.main.zone_id}"

  # These are DB-specific:
  db_domain_name    = "db-stage.nightbear.fi"
  db_domain_zone    = "${aws_route53_zone.main.zone_id}"
  db_admin_password = "${var.db_admin_password}"
}

module "web_stage" {
  source                             = "./utils/cloudfront_static_site"
  cloudfront_static_site_domain_name = "stage.nightbear.fi"
  cloudfront_static_site_domain_zone = "${aws_route53_zone.main.zone_id}"
  cloudfront_static_site_cache_ttl   = 10
}

module "hosting_prod" {
  source = "./hosting"

  # These apply to all services running on the shared hosting:
  hosting_hostname        = "nightbear-hosting-prod"
  hosting_ssh_public_key  = "${file("terraform.id_rsa.pub")}"
  hosting_ssh_private_key = "${file("terraform.id_rsa")}"
  hosting_syslog_uri      = "${var.papertrail_host}"

  # These are server-specific:
  server_domain_name = "server-prod.nightbear.fi"
  server_domain_zone = "${aws_route53_zone.main.zone_id}"

  # These are DB-specific:
  db_domain_name    = "db-prod.nightbear.fi"
  db_domain_zone    = "${aws_route53_zone.main.zone_id}"
  db_admin_password = "${var.db_admin_password}"
}

module "siren_ui" {
  source            = "./siren-ui"
  siren_ui_password = "${var.siren_ui_password}"
}
