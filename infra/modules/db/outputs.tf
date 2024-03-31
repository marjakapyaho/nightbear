output "endpoint" {
  value = aws_db_instance.this.endpoint
}

output "subnet_ids" {
  value = aws_db_subnet_group.this.subnet_ids
}
