variable "name_prefix" {
  description = "Name prefix to use for objects that need to be created (only lowercase alphanumeric characters and hyphens allowed, for S3 bucket name compatibility)"
  default     = "nightbear"
}

variable "tags" {
  description = "AWS Tags to add to all resources created (where possible); see https://aws.amazon.com/answers/account-management/aws-tagging-strategies/"
  type        = map(string)

  default = {
    Application = "nightbear"
    Environment = "infra"
  }
}

variable "papertrail_host_hosting" {
  description = "Docker hosting for all envs should log to this destination, e.g. using logspout"
}

variable "http_auth_password" {
  description = "Password for HTTP Basic Auth"
}

variable "influxdb_password_writer" {
  description = "Password for the InfluxDB server we write Telegraf metrics to"
}
