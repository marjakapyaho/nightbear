module "global_db" {
  source      = "./modules/db"
  name_prefix = "${var.name_prefix}-global-db"
  secrets     = var.secrets
}

module "stage_backend" {
  source      = "./modules/backend"
  name_prefix = "${var.name_prefix}-stage-backend"
  secrets     = var.secrets
  subnet_ids  = module.global_db.subnet_ids
}
