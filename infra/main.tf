module "global_db" {
  source      = "./modules/db"
  name_prefix = "${var.name_prefix}-global-db"
  secrets     = var.secrets
}
