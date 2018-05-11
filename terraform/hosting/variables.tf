# These apply to all services running on the shared hosting:

variable "hosting_hostname" {
  description = "Hostname by which this service is identified in logs etc"
}

variable "hosting_ssh_public_key" {
  description = "SSH public key for provisioning servers"
}

variable "hosting_ssh_private_key" {
  description = "SSH private key for provisioning servers"
}

variable "hosting_syslog_uri" {
  description = "A 'syslog://' URI on e.g. Papertrail to which docker-compose logs will be sent"
}

# These are server-specific:

variable "server_domain_name" {
  description = "Domain on which the server is available"
}

variable "server_domain_zone" {
  description = "Route 53 Zone ID on which to keep the DNS record for the server host"
}

# These are DB-specific:

variable "db_domain_name" {
  description = "Domain on which the DB is available"
}

variable "db_domain_zone" {
  description = "Route 53 Zone ID on which to keep the DNS record for the DB host"
}

variable "db_admin_password" {
  description = "CouchDB admin user password to use"
}
