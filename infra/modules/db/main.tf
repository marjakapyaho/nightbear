locals {
  username     = "nightbear"
  environments = ["stage", "prod"]
}

# We'll be using the default VPC for the DB
data "aws_vpc" "default" {
  default = true
}

# Figure out its subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Figure out the default security group for the default VPC
data "aws_security_group" "default" {
  vpc_id = data.aws_vpc.default.id
  name   = "default"
}

# Collection of subnets that the RDS instance can be provisioned in
resource "aws_db_subnet_group" "this" {
  name       = var.name_prefix
  subnet_ids = data.aws_subnets.default.ids
}

# Security group that lets us control incoming/outgoing traffic to/from the DB instance
resource "aws_security_group" "this" {
  name   = var.name_prefix
  vpc_id = data.aws_vpc.default.id
}

# White-list a specific IP for direct connectivity (until we get around to setting up a bastion host)
resource "aws_vpc_security_group_ingress_rule" "dev_access" {
  security_group_id = aws_security_group.this.id

  cidr_ipv4   = "${var.secrets.database_dev_access_ip}/32"
  ip_protocol = "tcp"
  from_port   = 5432
  to_port     = 5432
}

# Allow access to anyone within the same VPC
resource "aws_vpc_security_group_ingress_rule" "lambda_access" {
  security_group_id            = aws_security_group.this.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  referenced_security_group_id = data.aws_security_group.default.id
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
  publicly_accessible                   = true # this is required so that we can connect from outside the VPC
  apply_immediately                     = true # don't want to wait for the next maintenance window
  performance_insights_enabled          = true
  performance_insights_retention_period = 7     # included in free tier
  skip_final_snapshot                   = false # create a snapshot before deleting the instance
  backup_retention_period               = 1     # included in free tier
  delete_automated_backups              = false # don't remove automated backups immediately when instance is deleted
}
