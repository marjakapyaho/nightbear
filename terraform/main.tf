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

output "hosting_stage_ssh_command" {
  value = "ssh -i terraform.id_rsa -o StrictHostKeyChecking=no ${module.hosting_stage.hosting_username}@${module.hosting_stage.hosting_public_ip}"
}

output "metrics_cloudwatch_readonly_user_aws_secret_key" {
  description = "AWS Access Key ID (a.k.a. AWS_ACCESS_KEY_ID) for read-only access to CloudWatch metrics"
  value       = "${module.metrics.metrics_cloudwatch_readonly_user_aws_secret_key}"
}

output "metrics_cloudwatch_readonly_user_aws_access_key" {
  description = "AWS Secret Access Key (a.k.a. AWS_SECRET_ACCESS_KEY) for read-only access to CloudWatch metrics"
  value       = "${module.metrics.metrics_cloudwatch_readonly_user_aws_access_key}"
}
