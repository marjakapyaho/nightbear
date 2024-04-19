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

module "global_bastion" {
  source      = "./modules/bastion"
  name_prefix = "${var.name_prefix}-global-bastion"
  network     = module.global_vpc
  db          = module.global_db
}

module "stage_backend" {
  source               = "./modules/backend"
  name_prefix          = "${var.name_prefix}-stage-backend"
  secrets              = var.secrets
  network              = module.global_vpc
  db_connection_string = replace(module.global_db.connection_string, "DATABASE_NAME", "nightbear_stage")
}
