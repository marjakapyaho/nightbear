locals {
  instance_az = "${data.aws_availability_zones.this.names[0]}" # use the first available AZ, but use it consistently for all related resources
}

# Access data about available availability zones in the current region
data "aws_availability_zones" "this" {}

# Create an AWS Virtual Private Cloud (VPC) to launch our instances into
resource "aws_vpc" "this" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true          # https://stackoverflow.com/a/33443018

  tags {
    Name = "${var.ec2_docker_host_hostname}"
  }
}

# Create an internet gateway to give our subnet access to the outside world
resource "aws_internet_gateway" "this" {
  vpc_id = "${aws_vpc.this.id}"

  tags {
    Name = "${var.ec2_docker_host_hostname}"
  }
}

# Grant the VPC internet access on its main route table
resource "aws_route" "this" {
  route_table_id         = "${aws_vpc.this.main_route_table_id}"
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = "${aws_internet_gateway.this.id}"
}

# Create a subnet to launch our instances into
resource "aws_subnet" "this" {
  availability_zone       = "${local.instance_az}"
  vpc_id                  = "${aws_vpc.this.id}"
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags {
    Name = "${var.ec2_docker_host_hostname}"
  }
}

# Our default security group to access to the instances, over specific protocols
resource "aws_security_group" "this" {
  vpc_id = "${aws_vpc.this.id}"

  tags {
    Name = "${var.ec2_docker_host_hostname}"
  }
}

# Define incoming/outgoing network access rules for the VPC

resource "aws_security_group_rule" "incoming_ssh" {
  security_group_id = "${aws_security_group.this.id}"
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "incoming_http" {
  security_group_id = "${aws_security_group.this.id}"
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "incoming_https" {
  security_group_id = "${aws_security_group.this.id}"
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "outgoing_any" {
  security_group_id = "${aws_security_group.this.id}"
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
}

# Create an SSH key pair for accessing the EC2 instance
resource "aws_key_pair" "this" {
  public_key = "${var.ec2_docker_host_ssh_public_key}"
}

# Create the main EC2 instance
# https://www.terraform.io/docs/providers/aws/r/instance.html
resource "aws_instance" "this" {
  instance_type          = "${var.ec2_docker_host_instance_type}"
  ami                    = "${var.ec2_docker_host_instance_ami}"
  availability_zone      = "${local.instance_az}"
  key_name               = "${aws_key_pair.this.id}"              # the name of the SSH keypair to use for provisioning
  vpc_security_group_ids = ["${aws_security_group.this.id}"]      # our Security group to allow network access
  subnet_id              = "${aws_subnet.this.id}"                # launch into the subnet we created above

  tags {
    Name = "${var.ec2_docker_host_hostname}"
  }

  connection {
    user        = "${var.ec2_docker_host_instance_username}"
    private_key = "${var.ec2_docker_host_ssh_private_key}"
    agent       = false                                      # don't use SSH agent because we have the private key right here
  }

  # Set hostname
  provisioner "remote-exec" {
    inline = [
      "sudo hostnamectl set-hostname ${var.ec2_docker_host_hostname}",
      "echo 127.0.0.1 ${var.ec2_docker_host_hostname} | sudo tee -a /etc/hosts", # https://askubuntu.com/a/59517
    ]
  }

  # Install docker & compose
  provisioner "remote-exec" {
    script = "${path.module}/provision.sh"
  }

  # Transfer over some secrets for docker-compose
  provisioner "file" {
    content = <<EOF
COMPOSE_PROJECT_NAME=compose
EC2_DOCKER_HOST_HOSTNAME=${var.ec2_docker_host_hostname}
EC2_DOCKER_HOST_SYSLOG_URI=${var.ec2_docker_host_syslog_uri}
EOF

    destination = "/home/${var.ec2_docker_host_instance_username}/.env"
  }

  # Copy base docker-compose file
  provisioner "file" {
    source      = "${path.module}/docker-compose.yml"
    destination = "/home/${var.ec2_docker_host_instance_username}/docker-compose.yml"
  }

  # Pull images for the support services
  provisioner "remote-exec" {
    inline = ["echo Pulling docker images...; docker-compose pull --quiet"]
  }
}
