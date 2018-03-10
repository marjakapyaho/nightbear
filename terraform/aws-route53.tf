variable "aws_route53_default_ttl" {
  default = "300"
}

resource "aws_route53_zone" "main" {
  name = "nightbear.fi"
}

resource "aws_route53_record" "default-web" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "nightbear.fi"
  type    = "A"

  alias {
    name                   = "d1v0fks74vpmvu.cloudfront.net."
    zone_id                = "Z2FDTNDATAQYW2" # note: keep this in upper case, otherwise Terraform will keep seeing it as a difference when applying
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "legacy-nightscout" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "nightscout.nightbear.fi"
  type    = "A"
  ttl     = "${var.aws_route53_default_ttl}"
  records = ["46.101.64.73"]
}

resource "aws_route53_record" "router-web" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "${var.router_domain_name}"
  type    = "A"

  alias {
    name                   = "${aws_cloudfront_distribution.router_distribution.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.router_distribution.hosted_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "server-stage" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "server-stage.nightbear.fi"
  type    = "A"
  ttl     = "${var.aws_route53_default_ttl}"
  records = ["${aws_instance.server_stage.public_ip}"]
}

resource "aws_route53_record" "server-main" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "server.nightbear.fi"
  type    = "A"
  ttl     = "${var.aws_route53_default_ttl}"
  records = ["213.243.183.237"]
}
