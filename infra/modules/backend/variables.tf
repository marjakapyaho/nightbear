variable "name_prefix" {}

variable "secrets" {
  type = map(string)
}

variable "network" {}

variable "db_connection_string" {
  type = string
}
