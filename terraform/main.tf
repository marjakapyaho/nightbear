# Specify the provider and access details
provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "${var.aws_region}"
}

# https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html
# "To use an ACM Certificate with CloudFront, you must request or import the certificate in the US East (N. Virginia) region."
# https://www.terraform.io/docs/configuration/providers.html#multiple-provider-instances
provider "aws" {
  alias      = "acm_provider"
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-east-1"
}

resource "aws_route53_zone" "main" {
  name = "nightbear.fi"
}

module "email" {
  source            = "./email"
  email_domain_name = "nightbear.fi"
  email_domain_zone = "${aws_route53_zone.main.zone_id}"
}

module "metrics" {
  source = "./metrics"
}

module "router" {
  source             = "./router"
  router_domain_name = "router.nightbear.fi"
  router_domain_zone = "${aws_route53_zone.main.zone_id}"
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
