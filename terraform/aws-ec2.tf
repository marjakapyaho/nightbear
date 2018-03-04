# Based on https://github.com/terraform-providers/terraform-provider-aws/tree/master/examples/two-tier

# Create a VPC to launch our instances into
resource "aws_vpc" "default" {
  cidr_block = "10.0.0.0/16"
}

# Create an internet gateway to give our subnet access to the outside world
resource "aws_internet_gateway" "default" {
  vpc_id = "${aws_vpc.default.id}"
}

# Grant the VPC internet access on its main route table
resource "aws_route" "internet_access" {
  route_table_id         = "${aws_vpc.default.main_route_table_id}"
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = "${aws_internet_gateway.default.id}"
}

# Create a subnet to launch our instances into
resource "aws_subnet" "default" {
  vpc_id                  = "${aws_vpc.default.id}"
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
}

# Our default security group to access the instances over SSH and HTTP(S)
resource "aws_security_group" "default" {
  name   = "default_nightbear_ec2"
  vpc_id = "${aws_vpc.default.id}"

  # SSH access from anywhere
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access from the VPC
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access from the VPC
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create an SSH key pair for accessing the EC2 instance
resource "aws_key_pair" "auth" {
  key_name   = "${var.key_name}"
  public_key = "${file(var.public_key_path)}"
}

# Create the main EC2 instance
# https://www.terraform.io/docs/providers/aws/r/instance.html
resource "aws_instance" "web" {
  # The connection block tells our provisioner how to communicate with the resource (instance)
  # https://www.terraform.io/docs/provisioners/connection.html
  connection {
    # The default username for our AMI
    user = "ubuntu"
    # The connection will use the local SSH agent for authentication
  }

  # EC2 instance type & image
  instance_type = "t2.micro"
  ami = "${var.aws_ami}"

  # The name of our SSH keypair we created above
  key_name = "${aws_key_pair.auth.id}"

  # Our Security group to allow HTTP(S) and SSH access
  vpc_security_group_ids = ["${aws_security_group.default.id}"]

  # We're going to launch into the subnet we created above
  subnet_id = "${aws_subnet.default.id}"

  # Run a remote provisioner on the instance after creating it
  provisioner "remote-exec" {
    script = "aws-ec2-provision.sh"
  }
}

# Output connection info for manual tweaks (if necessary)
output "ec2_ssh_command" {
  value = "ssh ubuntu@${aws_instance.web.public_ip}"
}
