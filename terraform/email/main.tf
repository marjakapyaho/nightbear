resource "aws_route53_record" "mx" {
  zone_id = "${var.email_domain_zone}"
  name    = "${var.email_domain_name}"
  type    = "MX"
  ttl     = 300

  records = [
    "10 mxa.mailgun.org",
    "10 mxb.mailgun.org",
  ]
}

resource "aws_route53_record" "txt1" {
  zone_id = "${var.email_domain_zone}"
  name    = "${var.email_domain_name}"
  type    = "TXT"
  ttl     = 300
  records = ["v=spf1 include:mailgun.org ~all"]
}

resource "aws_route53_record" "txt2" {
  zone_id = "${var.email_domain_zone}"
  name    = "mx._domainkey.${var.email_domain_name}"
  type    = "TXT"
  ttl     = 300
  records = ["k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDJgFRTe8Ahd44OfXQRntnm1iNDW3p5pUzqdpxjcoBgoyriQN2GqANUxjXE19S8O/TtMCbmhrviPqgB5Z3v+GGGSQpa60BbZlmyF5dNdp8+tNA+ItOMFbbzImo2y34rTYitQk5fUbwfkZwram6Ph3Vw9GQiwUXmAwsy4fbTgeAIpwIDAQAB"]
}

resource "aws_route53_record" "mail" {
  zone_id = "${var.email_domain_zone}"
  name    = "email.${var.email_domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["mailgun.org"]
}
