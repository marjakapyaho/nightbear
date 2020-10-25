output "hosting" {
  value = {
    hostname     = module.docker_host.hostname
    instance_id  = module.docker_host.instance_id
    public_ip    = module.docker_host.public_ip
    ssh_username = module.docker_host.ssh_username
  }
}
