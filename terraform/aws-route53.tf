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

resource "aws_route53_record" "mailgun-mx" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "nightbear.fi"
  type    = "MX"
  ttl     = "300"
  records = [
    "10 mxa.mailgun.org",
    "10 mxb.mailgun.org",
  ]
}

resource "aws_route53_record" "mailgun-txt1" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "nightbear.fi"
  type    = "TXT"
  ttl     = "300"
  records = ["v=spf1 include:mailgun.org ~all"]
}

resource "aws_route53_record" "mailgun-txt2" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "mx._domainkey.nightbear.fi"
  type    = "TXT"
  ttl     = "300"
  records = ["k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDJgFRTe8Ahd44OfXQRntnm1iNDW3p5pUzqdpxjcoBgoyriQN2GqANUxjXE19S8O/TtMCbmhrviPqgB5Z3v+GGGSQpa60BbZlmyF5dNdp8+tNA+ItOMFbbzImo2y34rTYitQk5fUbwfkZwram6Ph3Vw9GQiwUXmAwsy4fbTgeAIpwIDAQAB"]
}

resource "aws_route53_record" "mailgun-mail" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "email.nightbear.fi"
  type    = "CNAME"
  ttl     = "300"
  records = ["mailgun.org"]
}

resource "aws_route53_record" "legacy-nightscout" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "nightscout.nightbear.fi"
  type    = "A"
  ttl     = "300"
  records = ["46.101.64.73"]
}

resource "aws_route53_record" "router-web" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "router.nightbear.fi"
  type    = "A"

  alias {
    name                   = "d31zrelk63kshh.cloudfront.net."
    zone_id                = "Z2FDTNDATAQYW2" # note: keep this in upper case, otherwise Terraform will keep seeing it as a difference when applying
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "router-domain-validation" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "_47c30228735fe5c8c5d1a09bbcf36fae.router.nightbear.fi"
  type    = "CNAME"
  ttl     = "300"
  records = ["_cbf2a92d99e8b74b157957147eb1963a.acm-validations.aws"]
}

resource "aws_route53_record" "server-stage" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "server-stage.nightbear.fi"
  type    = "CNAME"
  ttl     = "300"
  records = ["ec2-18-196-232-153.eu-central-1.compute.amazonaws.com"]
}

resource "aws_route53_record" "server-main" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "server.nightbear.fi"
  type    = "A"
  ttl     = "300"
  records = ["213.243.183.237"]
}
