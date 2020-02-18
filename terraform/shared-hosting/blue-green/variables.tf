variable "color" {}

variable "couchdb_admin_password" {}

variable "pushover_user" {}

variable "pushover_token" {}

variable "papertrail_host_legacy" {}

variable "papertrail_host_hosting" {
  description = "Docker hosting for all envs & colors should log to this destination, e.g. using logspout"
}

variable "backup_config" {
  type = "map"
}

variable "port_map" {
  type = "map"
}
