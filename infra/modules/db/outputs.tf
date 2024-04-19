output "instance_endpoint" {
  value = aws_db_instance.this.endpoint
}

output "connection_string" {
  value = { for env in local.environments : env =>
    "postgres://${local.username}:${var.secrets.database_password}@${aws_db_instance.this.endpoint}/nightbear_${env}?sslmode=no-verify"
  }
}
