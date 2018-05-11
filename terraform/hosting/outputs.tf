output "hosting_public_ip" {
  description = "Public IP address assigned to the host by EC2"
  value       = "${module.host.ec2_docker_host_public_ip}"
}

output "hosting_username" {
  description = "Username that can be used to access the EC2 instance over SSH"
  value       = "${module.host.ec2_docker_host_username}"
}
