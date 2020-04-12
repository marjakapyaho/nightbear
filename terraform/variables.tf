variable "aws_access_key" {
  description = "AWS Access Key ID (a.k.a. AWS_ACCESS_KEY_ID)"
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key (a.k.a. AWS_SECRET_ACCESS_KEY)"
}

variable "papertrail_host" {
  description = "syslog drain to use for sending logs to Papertrail"
}

variable "couchdb_password_stage" {
  description = "Password to set on the staging env CouchDB"
}

variable "db_admin_password" {
  description = "Default admin password to set on CouchDB"
}

variable "siren_ui_password" {
  description = "HTTP Basic Auth password required to access the Siren UI"
}

variable "aws_region" {
  description = "AWS Region (AWS_DEFAULT_REGION)"
  default     = "eu-central-1"
}

variable "aws_ami" {
  description = "Which AMI to use on EC2"
  default     = "ami-236f0d4c"            # == Ubuntu 17.10 on eu-central-1
}

variable "mailgun_api_key" {}

variable "mailgun_smtp_password" {}

variable "pushover_user" {}

variable "pushover_token" {}

variable "papertrail_host_legacy" {}

variable "papertrail_host_hosting" {}
