module "stage_backend" {
  source      = "./modules/backend"
  name_prefix = "${var.name_prefix}-stage-backend"
  secrets     = var.secrets
}
