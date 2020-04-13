module "global" {
  source      = "./modules/global"
  providers   = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region
  name_prefix = "${var.name_prefix}-global"
  tags        = merge(var.tags, { Environment = "global" })
}

module "stage" {
  source      = "./modules/main"
  providers   = { aws.us_east_1 = aws.us_east_1 } # this alias is needed because ACM is only available in the "us-east-1" region
  name_prefix = "${var.name_prefix}-stage"
  tags        = merge(var.tags, { Environment = "stage" })
}
