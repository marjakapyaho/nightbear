variable "cloudfront_static_site_domain_name" {
  description = "Domain on which the DNS records are created"
}

variable "cloudfront_static_site_domain_zone" {
  description = "Route 53 Zone ID on which to keep the DNS records"
}

variable "cloudfront_static_site_bucket_prefix" {
  description = "Prefix for the S3 bucket name that will be created (e.g. 'cloudfront_static_site_'); suffix is based on the domain name"
  default     = ""
}
