module "global_vpc" {
  source      = "./modules/vpc"
  name_prefix = "${var.name_prefix}-global-vpc"
}

module "global_db" {
  source      = "./modules/db"
  name_prefix = "${var.name_prefix}-global-db"
  secrets     = var.secrets
  network     = module.global_vpc
}

module "stage_backend" {
  source               = "./modules/backend"
  name_prefix          = "${var.name_prefix}-stage-backend"
  secrets              = var.secrets
  network              = module.global_vpc
  db_connection_string = module.global_db.connection_string.stage
}
