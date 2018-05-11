output "metrics_cloudwatch_readonly_user_aws_secret_key" {
  description = "AWS Access Key ID (a.k.a. AWS_ACCESS_KEY_ID) for read-only access to CloudWatch metrics"
  value       = "${aws_iam_access_key.this.secret}"
}

output "metrics_cloudwatch_readonly_user_aws_access_key" {
  description = "AWS Secret Access Key (a.k.a. AWS_SECRET_ACCESS_KEY) for read-only access to CloudWatch metrics"
  value       = "${aws_iam_access_key.this.id}"
}
