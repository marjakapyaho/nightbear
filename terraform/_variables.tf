variable "access_key" {
  description = "AWS Access Key ID (AWS_ACCESS_KEY_ID)"
}

variable "secret_key" {
  description = "AWS Secret Access Key (AWS_SECRET_ACCESS_KEY)"
}

variable "region" {
  description = "AWS Region (AWS_DEFAULT_REGION)"
  default     = "eu-central-1"
}

variable "ec2_provisioner_public_key" {
  description = "Public SSH key for EC2 provisioning."
}

variable "ec2_provisioner_private_key" {
  description = "Private SSH key for EC2 provisioning."
}

variable "aws_ami" {
  description = "Which AMI to use on EC2"
  default     = "ami-236f0d4c" # == Ubuntu 17.10 on eu-central-1
}
