module "my_email_forwarder" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_ses_forwarder#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v13.0...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_ses_forwarder?ref=v13.0"

  name_prefix    = "${var.name_prefix}-email"
  email_domain   = "nightbear.fi"
  forward_all_to = ["jarno@jrw.fi", "marja.kapyaho@iki.fi"]
}
