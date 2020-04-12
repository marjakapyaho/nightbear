# Create a new Mailgun domain
resource "mailgun_domain" "this" {
  name        = "${var.mail_domain}"
  spam_action = "${var.spam_action}"
  wildcard    = "${var.wildcard}"
  region      = "us"
}

# DNS records for domain setup & verification are below
# See https://app.mailgun.com/app/domains/<your-domain>/verify for these instructions

# resource "aws_route53_record" "sending" {
#   count = "${length(mailgun_domain.this.sending_records)}"

#   zone_id = "${data.aws_route53_zone.this.zone_id}"
#   name    = "${lookup(mailgun_domain.this.sending_records[count.index], "name")}"
#   type    = "${lookup(mailgun_domain.this.sending_records[count.index], "record_type")}"
#   ttl     = 300
#   records = [
#     "${lookup(mailgun_domain.this.sending_records[count.index], "value")}",
#   ]
# }

resource "aws_route53_record" "sending_1" {
  zone_id = "${data.aws_route53_zone.this.zone_id}"
  name    = "nightbear.fi"
  type    = "TXT"
  ttl     = 300
  records = ["v=spf1 include:mailgun.org ~all"]
}

resource "aws_route53_record" "sending_2" {
  zone_id = "${data.aws_route53_zone.this.zone_id}"
  name    = "krs._domainkey.nightbear.fi"
  type    = "TXT"
  ttl     = 300
  records = ["k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDwpqeEePcPK77LE10FtGTNMO96VV2XfWtJAADiTgIGSIWSwaTBjuV7Y6pm5du2gEeoaAyIWux2lxP6RnecJVTt0RKmKIe4hf7ST6+dPyDST/uXqrnwUjvoS7l31qRX8BueFvgThLaeBieesOuZOkc1O/Q2Uacdvc35Ec3pOsDRQIDAQAB"]
}

resource "aws_route53_record" "sending_3" {
  zone_id = "${data.aws_route53_zone.this.zone_id}"
  name    = "email.nightbear.fi"
  type    = "CNAME"
  ttl     = 300
  records = ["mailgun.org"]
}

# resource "aws_route53_record" "receiving" {
#   zone_id = "${data.aws_route53_zone.this.zone_id}"
#   name    = "${var.mail_domain}"
#   type    = "${lookup(mailgun_domain.this.receiving_records[0], "record_type")}"
#   ttl     = 300

#   records = [
#     "${lookup(mailgun_domain.this.receiving_records[0], "priority")} ${lookup(mailgun_domain.this.receiving_records[0], "value")}",
#     "${lookup(mailgun_domain.this.receiving_records[1], "priority")} ${lookup(mailgun_domain.this.receiving_records[1], "value")}",
#   ]
# }

resource "aws_route53_record" "receiving" {
  zone_id = "${data.aws_route53_zone.this.zone_id}"
  name    = "nightbear.fi"
  type    = "MX"
  ttl     = 300

  records = [
    "10 mxb.mailgun.org",
    "10 mxa.mailgun.org",
  ]
}
