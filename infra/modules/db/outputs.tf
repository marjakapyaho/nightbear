output "instance_endpoint" {
  value = aws_db_instance.this.endpoint
}

output "credentials" {
  value = "${local.username}:${var.secrets.database_password}"
}

output "connection_string" {
  value = "postgres://${local.username}:${var.secrets.database_password}@${aws_db_instance.this.endpoint}/DATABASE_NAME?sslmode=no-verify"
}
