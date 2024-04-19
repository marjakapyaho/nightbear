locals {
  username = "nightbear"
}

# Collection of subnets that the RDS instance can be provisioned in
resource "aws_db_subnet_group" "this" {
  name       = var.name_prefix
  subnet_ids = var.network.subnet_ids.private
}

# Main DB instance
resource "aws_db_instance" "this" {
  identifier                            = var.name_prefix
  allocated_storage                     = 20            # included in free tier
  instance_class                        = "db.t3.micro" # included in free tier
  engine                                = "postgres"
  engine_version                        = "16.2"
  username                              = local.username
  password                              = var.secrets.database_password
  allow_major_version_upgrade           = false
  auto_minor_version_upgrade            = true
  db_subnet_group_name                  = aws_db_subnet_group.this.name
  vpc_security_group_ids                = [aws_security_group.this.id]
  publicly_accessible                   = false # can't do this because: "Cannot create a publicly accessible DBInstance. The specified VPC has no internet gateway attached"
  apply_immediately                     = true  # don't want to wait for the next maintenance window
  performance_insights_enabled          = true
  performance_insights_retention_period = 7 # included in free tier
  backup_retention_period               = 1 # included in free tier
}

# Security group that lets us control incoming/outgoing traffic to/from the DB instance
resource "aws_security_group" "this" {
  name   = var.name_prefix
  vpc_id = var.network.vpc_id
}

# Allow access to anyone within the same VPC
resource "aws_vpc_security_group_ingress_rule" "vpc" {
  security_group_id = aws_security_group.this.id
  cidr_ipv4         = var.network.cidr_block
  ip_protocol       = "tcp"
  from_port         = 5432
  to_port           = 5432
}
