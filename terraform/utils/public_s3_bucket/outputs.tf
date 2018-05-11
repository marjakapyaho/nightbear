output "public_s3_bucket_ssl_endpoint" {
  description = "Full URL for the HTTPS endpoint for accessing the bucket"
  value       = "https://s3.${data.aws_region.this.name}.amazonaws.com/${aws_s3_bucket.this.id}/"
}

output "public_s3_bucket_domain_name" {
  description = "e.g. 'bucketname.s3.amazonaws.com'"
  value       = "${aws_s3_bucket.this.bucket_domain_name}"
}

output "public_s3_bucket_website_domain_name" {
  description = "e.g. 'nightbear-web-stage-nightbear-fi.s3-website.eu-central-1.amazonaws.com'"
  value       = "${aws_s3_bucket.this.website_endpoint}"
}
