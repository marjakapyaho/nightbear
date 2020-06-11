output "hosting" {
  value = module.docker_host
}

output "htpasswd" {
  value = random_string.hosting_basic_auth_password.result
}
