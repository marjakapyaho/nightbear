variable "aws_access_key" {
  description = "AWS Access Key ID (AWS_ACCESS_KEY_ID)"
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key (AWS_SECRET_ACCESS_KEY)"
}

variable "aws_region" {
  description = "AWS Region (AWS_DEFAULT_REGION)"
  default     = "eu-central-1"
}

variable "aws_ami" {
  description = "Which AMI to use on EC2"
  default     = "ami-236f0d4c" # == Ubuntu 17.10 on eu-central-1
}
