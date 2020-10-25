module "ui" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_static_site#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v13.0...master
  source    = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_static_site?ref=v13.0"
  providers = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region

  name_prefix         = "${var.name_prefix}-ui"
  site_domain         = var.ui_domain
  tags                = merge(var.tags, { Component = "ui" })
  client_side_routing = true # every request that doesn't match a static file in the bucket will get rewritten to the index file; this allows you to handle routing fully in client-side JavaScript
}
