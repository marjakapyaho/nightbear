resource "aws_route53_record" "mailgun-mx" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "nightbear.fi"
  type    = "MX"
  ttl     = "${var.aws_route53_default_ttl}"
  records = [
    "10 mxa.mailgun.org",
    "10 mxb.mailgun.org",
  ]
}

resource "aws_route53_record" "mailgun-txt1" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "nightbear.fi"
  type    = "TXT"
  ttl     = "${var.aws_route53_default_ttl}"
  records = ["v=spf1 include:mailgun.org ~all"]
}

resource "aws_route53_record" "mailgun-txt2" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "mx._domainkey.nightbear.fi"
  type    = "TXT"
  ttl     = "${var.aws_route53_default_ttl}"
  records = ["k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDJgFRTe8Ahd44OfXQRntnm1iNDW3p5pUzqdpxjcoBgoyriQN2GqANUxjXE19S8O/TtMCbmhrviPqgB5Z3v+GGGSQpa60BbZlmyF5dNdp8+tNA+ItOMFbbzImo2y34rTYitQk5fUbwfkZwram6Ph3Vw9GQiwUXmAwsy4fbTgeAIpwIDAQAB"]
}

resource "aws_route53_record" "mailgun-mail" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name    = "email.nightbear.fi"
  type    = "CNAME"
  ttl     = "${var.aws_route53_default_ttl}"
  records = ["mailgun.org"]
}
