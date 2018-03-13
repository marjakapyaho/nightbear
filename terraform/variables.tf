variable "aws_access_key" {
  description = "AWS Access Key ID (a.k.a. AWS_ACCESS_KEY_ID)"
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key (a.k.a. AWS_SECRET_ACCESS_KEY)"
}

variable "papertrail_host" {
  description = "syslog drain to use for sending logs to Papertrail (a.k.a. NIGHTBEAR_PAPERTRAIL_HOST)"
}

variable "aws_region" {
  description = "AWS Region (AWS_DEFAULT_REGION)"
  default     = "eu-central-1"
}

variable "aws_ami" {
  description = "Which AMI to use on EC2"
  default     = "ami-236f0d4c"            # == Ubuntu 17.10 on eu-central-1
}
