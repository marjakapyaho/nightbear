variable "color" {}

variable "couchdb_admin_password" {}

variable "pushover_user" {}

variable "pushover_token" {}

variable "papertrail_host_legacy" {}

variable "backup_config" {
  type = "map"
}

variable "port_map" {
  type = "map"
}
