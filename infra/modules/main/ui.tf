module "ui" {
  source    = "../aws_static_site"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix = "${var.name_prefix}-ui"
  site_domain = "stage.nightbear.fi"
  tags        = merge(var.tags, { Component = "ui" })
}
