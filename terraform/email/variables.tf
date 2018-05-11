variable "email_domain_name" {
  description = "Domain on which the DNS records are made"
}

variable "email_domain_zone" {
  description = "Route 53 Zone ID on which to keep the DNS records for the server host"
}
