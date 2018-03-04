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

variable "public_key_path" {
  description = <<DESCRIPTION
Path to the SSH public key to be used for authentication.
Ensure this keypair is added to your local SSH agent so provisioners can connect.
Example: $ ssh-add -K ~/.ssh/id_rsa
DESCRIPTION
  default     = "~/.ssh/id_rsa"
}

variable "key_name" {
  description = "Name to associate with the SSH key"
  default     = "terraform-deployer"
}

variable "aws_ami" {
  description = "Which AMI to use on EC2"
  default     = "ami-236f0d4c" # == Ubuntu 17.10 on eu-central-1
}
