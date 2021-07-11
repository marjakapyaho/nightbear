locals {
  loki_url = "https://loki.jrw.fi/"

  promtail_config = yamlencode({
    server = {
      http_listen_port = 9080
      grpc_listen_port = 0
    }

    positions = {
      filename = "/tmp/promtail/positions.yaml"
    }

    clients = [
      {
        url = "${local.loki_url}loki/api/v1/push"
        basic_auth = {
          username = "admin"
          password = var.secrets.loki_password_admin
        }
      }
    ]

    scrape_configs = [
      {
        job_name = "systemd-journal"
        journal = {
          path    = "/var/log/journal"
          max_age = "12h"
          labels = {
            hostname = module.docker_host.hostname
            job      = "systemd-journal"
          }
        }
        relabel_configs = [
          {
            source_labels = ["__journal__systemd_unit"]
            target_label  = "unit"
          },
          {
            source_labels = ["__journal_container_name"]
            target_label  = "container_name"
          },
        ]
      },
    ]
  })
}

resource "null_resource" "promtail_config" {
  depends_on = [module.docker_host]                        # wait until the host is ready
  triggers   = { promtail_config = local.promtail_config } # re-run if the config changes

  connection {
    host        = module.docker_host.public_ip
    user        = module.docker_host.ssh_username
    private_key = module.docker_host.ssh_private_key
    agent       = false
  }

  provisioner "file" {
    destination = "/home/${module.docker_host.ssh_username}/promtail-config.yaml"
    content     = local.promtail_config
  }

  provisioner "remote-exec" {
    inline = [
      "docker restart promtail && echo 'Service successfully restarted' || echo 'Service not running, no need to restart'", # restart service to reload config
    ]
  }
}
