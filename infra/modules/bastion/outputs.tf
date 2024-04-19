output "tunnel_command" {
  value = "ssh -N -i ${local.ssh_private_key_path} -o StrictHostKeyChecking=no -L localhost:${local.local_port}:${var.db.instance_endpoint} ${local.ssh_username}@${aws_instance.this.public_ip}"
}

output "local_connection_string" {
  value = "postgres://${var.db.credentials}@localhost:${local.local_port}/DATABASE_NAME"
}

output "local_shell_command" {
  value = "docker run -it --rm postgres psql postgres://${var.db.credentials}@host.docker.internal:${local.local_port}/DATABASE_NAME"
}
