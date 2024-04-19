# Create an SSH key pair for accessing the EC2 instance
resource "aws_key_pair" "this" {
  public_key = file("terraform.id_rsa.pub")
}

# Create the security group with access to the instance
resource "aws_security_group" "this" {
  vpc_id = var.network.vpc_id
}

# Allow all outgoing connections, so we can reach the DB
resource "aws_security_group_rule" "outgoing_any" {
  security_group_id = aws_security_group.this.id
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
}

# Allow incoming SSH, so we can connect
resource "aws_security_group_rule" "incoming_ssh" {
  security_group_id = aws_security_group.this.id
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
}
