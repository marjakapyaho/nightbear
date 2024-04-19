output "tunnel_command" {
  value = "ssh -i ${local.ssh_private_key_path} -o StrictHostKeyChecking=no -L localhost:35432:${var.db.instance_endpoint} ${local.ssh_username}@${aws_instance.this.public_ip}"
}
