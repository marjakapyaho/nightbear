variable "name_prefix" {}

variable "secrets" {
  type = map(string)
}

variable "subnet_ids" {
  type = set(string)
}
