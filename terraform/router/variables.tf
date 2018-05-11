variable "router_domain_name" {
  description = "Domain on which the Router will be made available (e.g. 'api.example.com')"
}

variable "router_domain_zone" {
  description = "Route 53 Zone ID on which to keep the DNS records"
}
