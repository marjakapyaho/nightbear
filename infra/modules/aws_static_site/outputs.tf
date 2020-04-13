output "resources" {
  description = "Names/ID's of resources created; can be used for e.g. monitoring, or attaching external resources"
  value = {
    aws_reverse_proxy = module.aws_reverse_proxy.resources
    s3_bucket         = aws_s3_bucket.this.id
  }
}
