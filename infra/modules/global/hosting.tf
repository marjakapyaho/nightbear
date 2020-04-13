locals {
  hostname                    = "${var.name_prefix}-hosting"
  unattended_upgrades_enabled = true
  unattended_upgrades_file    = "/etc/apt/apt.conf.d/51unattended-upgrades-custom"
}

resource "aws_ebs_volume" "data" {
  availability_zone = module.docker_host.availability_zone # ensure the volume is created in the same AZ the docker host
  type              = "gp2"                                # i.e. "Amazon EBS General Purpose SSD"
  size              = 64                                   # in GiB; if you change this in-place, you need to SSH over and run e.g. $ sudo resize2fs /dev/xvdh

  tags = merge(var.tags, {
    Component = "hosting"
    Name      = local.hostname # give the data volume a name that makes it easier to identify as belonging to this host
  })
}

module "docker_host" {
  source = "../aws_ec2_ebs_docker_host"

  hostname             = local.hostname
  ssh_private_key_path = "terraform.id_rsa"
  ssh_public_key_path  = "terraform.id_rsa.pub"
  data_volume_id       = aws_ebs_volume.data.id
  tags                 = merge(var.tags, { Component = "hosting" })
  allow_incoming_http  = true # by default, only incoming SSH is allowed; other protocols for the security group are opt-in
}

resource "null_resource" "unattended_upgrades" {
  depends_on = [module.docker_host]                      # wait until other provisioners within the module have finished
  count      = local.unattended_upgrades_enabled ? 1 : 0 # somewhat unintuitively, "destroy" time provisioners only run on "count = 0", not when this resource is destroyed

  connection {
    host        = module.docker_host.public_ip
    user        = module.docker_host.ssh_username
    private_key = module.docker_host.ssh_private_key
    agent       = false
  }

  provisioner "remote-exec" {
    inline = [<<EOF
echo '
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "13:00";
' | sudo tee ${local.unattended_upgrades_file}
EOF
    ]
  }

  provisioner "remote-exec" {
    when   = destroy
    inline = ["sudo rm -fv ${local.unattended_upgrades_file}"]
  }
}

module "docker_compose" {
  source = "../docker_compose_host"

  public_ip       = module.docker_host.public_ip
  ssh_username    = module.docker_host.ssh_username
  ssh_private_key = module.docker_host.ssh_private_key

  docker_compose_yml = <<EOF
version: "3"

services:

  test:
    image: nginx:latest
    restart: always
    ports:
      - "80:80"

  logspout:
    image: gliderlabs/logspout:v3.2.6
    restart: always
    command: syslog+tls://${var.papertrail_host_hosting}
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"

EOF
}
