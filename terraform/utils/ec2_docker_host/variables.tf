variable "ec2_docker_host_hostname" {
  description = "Hostname by which this service is identified in metrics, logs etc"
}

variable "ec2_docker_host_instance_type" {
  description = "See https://aws.amazon.com/ec2/instance-types/ for options"
  default     = "t2.micro"                                                   # after changing this, you may need to apply again, otherwise Terraform may miss the public IP change
}

variable "ec2_docker_host_instance_ami" {
  description = "See https://cloud-images.ubuntu.com/locator/ec2/ for options"
  default     = "ami-7c412f13"                                                 # ami-7c412f13 = eu-central-1, xenial, 16.04 LTS, amd64, hvm:ebs-ssd
}

variable "ec2_docker_host_instance_username" {
  description = "Default username built into the AMI (ec2_docker_host_instance_ami)"
  default     = "ubuntu"
}

variable "ec2_docker_host_ssh_public_key" {
  description = "SSH public key for provisioning servers"
}

variable "ec2_docker_host_ssh_private_key" {
  description = "SSH private key for provisioning servers"
}

variable "ec2_docker_host_syslog_uri" {
  description = "A 'syslog://' URI on e.g. Papertrail to which docker-compose logs will be sent"
}
