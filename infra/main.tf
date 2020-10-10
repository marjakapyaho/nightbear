module "global" {
  source                   = "./modules/global"
  providers                = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region
  name_prefix              = "${var.name_prefix}-global"
  tags                     = merge(var.tags, { Environment = "global" })
  papertrail_host_hosting  = var.papertrail_host_hosting
  http_auth_password       = var.http_auth_password
  influxdb_password_writer = var.influxdb_password_writer
}

module "stage" {
  source      = "./modules/main"
  providers   = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region
  name_prefix = "${var.name_prefix}-stage"
  tags        = merge(var.tags, { Environment = "stage" })
  ui_domain   = "stage.nightbear.fi"
}

module "prod" {
  source      = "./modules/main"
  providers   = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region
  name_prefix = "${var.name_prefix}-prod"
  tags        = merge(var.tags, { Environment = "prod" })
  ui_domain   = "nightbear.fi"
}
