data "aws_route53_zone" "this" {
  name = "nightbear.fi"
}

resource "aws_route53_record" "this" {
  zone_id = "${data.aws_route53_zone.this.zone_id}"
  name    = "hosting.nightbear.fi"
  type    = "CNAME"
  ttl     = 60
  records = ["hosting-${local.active_color}.nightbear.fi"]
}

module "hosting_blue" {
  source = "./blue-green"

  color                   = "blue"
  port_map                = "${local.port_map}"
  couchdb_admin_password  = "${var.couchdb_admin_password}"
  pushover_user           = "${var.pushover_user}"
  pushover_token          = "${var.pushover_token}"
  papertrail_host_legacy  = "${var.papertrail_host_legacy}"
  papertrail_host_hosting = "${var.papertrail_host_hosting}"
  backup_config           = "${local.backup_config}"
}
