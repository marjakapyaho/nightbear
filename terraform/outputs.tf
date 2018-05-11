output "hosting_stage_ssh_command" {
  description = "SSH command for stage env hosting"
  value       = "ssh -i terraform.id_rsa -o StrictHostKeyChecking=no ${module.hosting_stage.hosting_username}@${module.hosting_stage.hosting_public_ip}"
}

output "metrics_cloudwatch_readonly_user_aws_secret_key" {
  description = "AWS Access Key ID (a.k.a. AWS_ACCESS_KEY_ID) for read-only access to CloudWatch metrics"
  value       = "${module.metrics.metrics_cloudwatch_readonly_user_aws_secret_key}"
}

output "metrics_cloudwatch_readonly_user_aws_access_key" {
  description = "AWS Secret Access Key (a.k.a. AWS_SECRET_ACCESS_KEY) for read-only access to CloudWatch metrics"
  value       = "${module.metrics.metrics_cloudwatch_readonly_user_aws_access_key}"
}
