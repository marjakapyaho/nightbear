# Create a host on which to run dockerized services
module "host" {
  source                          = "../utils/ec2_docker_host"
  ec2_docker_host_hostname        = "${var.hosting_hostname}"
  ec2_docker_host_ssh_public_key  = "${var.hosting_ssh_public_key}"
  ec2_docker_host_ssh_private_key = "${var.hosting_ssh_private_key}"
  ec2_docker_host_syslog_uri      = "${var.hosting_syslog_uri}"
}

# Create a separate data volume, which can be attached to any EC2 instance as needed
resource "aws_ebs_volume" "this" {
  availability_zone = "${module.host.ec2_docker_host_instance_az}" # use the same AZ as the host
  type              = "gp2"                                        # i.e. "Amazon EBS General Purpose SSD"
  size              = 10                                           # in GB; after changing this, you need to SSH over and run e.g. $ sudo resize2fs /dev/xvdh

  tags {
    Name = "${var.hosting_hostname}"
  }
}

# Attach the separate data volume to the instance, if it exists
resource "aws_volume_attachment" "this" {
  device_name = "/dev/xvdh"                                  # note: this can't be arbitrarily changed!
  instance_id = "${module.host.ec2_docker_host_instance_id}"
  volume_id   = "${aws_ebs_volume.this.id}"
}

# Clients can reach the server on this DNS name
resource "aws_route53_record" "server" {
  zone_id = "${var.server_domain_zone}"
  name    = "${var.server_domain_name}"
  type    = "A"
  ttl     = 300
  records = ["${module.host.ec2_docker_host_public_ip}"]
}

# Clients can reach the DB on this DNS name
resource "aws_route53_record" "db" {
  zone_id = "${var.db_domain_zone}"
  name    = "${var.db_domain_name}"
  type    = "A"
  ttl     = 300
  records = ["${module.host.ec2_docker_host_public_ip}"]
}

# Provisioners for setting up the host, once it's up
resource "null_resource" "provisioners" {
  depends_on = ["aws_volume_attachment.this", "aws_route53_record.server"] # because we depend on the EBS volume being available, and the domain being registered

  triggers {
    ec2_docker_host_instance_id = "${module.host.ec2_docker_host_instance_id}" # if the ec2_docker_host is re-provisioned, ensure these provisioners also re-run
  }

  connection {
    host        = "${module.host.ec2_docker_host_public_ip}"
    user        = "${module.host.ec2_docker_host_username}"
    private_key = "${var.hosting_ssh_private_key}"
    agent       = false                                      # don't use SSH agent because we have the private key right here
  }

  # Prepare & mount EBS volume
  provisioner "remote-exec" {
    script = "${path.module}/provision-ebs-volume.sh"
  }

  # Transfer additional secrets in addition to the baseline from the "ec2_docker_host" module
  provisioner "remote-exec" {
    inline = [
      "echo server_domain_name=${var.server_domain_name} >> .env",
      "echo db_domain_name=${var.db_domain_name} >> .env",
      "echo db_admin_password=${var.db_admin_password} >> .env",
    ]
  }

  # Copy docker-compose config
  provisioner "file" {
    source      = "${path.module}/docker-compose.yml"
    destination = "/home/${module.host.ec2_docker_host_username}/docker-compose.override.yml"
  }

  # Install server depedencies
  provisioner "remote-exec" {
    script = "${path.module}/provision-server.sh"
  }

  # Prepare CouchDB for first use
  provisioner "remote-exec" {
    script = "${path.module}/provision-db.sh"
  }

  # Run first-time server deploy
  provisioner "local-exec" {
    command = "${path.module}/deploy-latest-server.sh"
  }
}
