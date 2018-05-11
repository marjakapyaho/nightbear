resource "aws_route53_zone" "main" {
  name = "nightbear.fi"
}

resource "aws_route53_record" "default-web" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "nightbear.fi"
  type    = "A"

  alias {
    name                   = "d1v0fks74vpmvu.cloudfront.net."
    zone_id                = "Z2FDTNDATAQYW2"                 # note: keep this in upper case, otherwise Terraform will keep seeing it as a difference when applying
    evaluate_target_health = false
  }
}
