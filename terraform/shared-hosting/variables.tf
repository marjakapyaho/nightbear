variable "couchdb_admin_password" {}

variable "pushover_user" {}

variable "pushover_token" {}

variable "papertrail_host_legacy" {}

locals {
  active_color = "blue"

  port_map = {
    db-prod      = 50000
    db-stage     = 50001
    legacy       = 50002
    server-prod  = 50003
    server-stage = 50004
  }
}
