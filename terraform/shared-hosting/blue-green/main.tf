resource "aws_ebs_volume" "this" {
  availability_zone = "${module.docker_host.availability_zone}" # ensure the volume is created in the same AZ the docker host
  type              = "gp2"                                     # i.e. "Amazon EBS General Purpose SSD"
  size              = 25                                        # in GiB; if you change this in-place, you need to SSH over and run e.g. $ sudo resize2fs /dev/xvdh

  tags = {
    Name                  = "nightbear-hosting-${var.color}"
    Nightbear_Component   = "hosting"
    Nightbear_Environment = "mixed"
  }
}

module "docker_host" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_ec2_ebs_docker_host#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v11.0...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_ec2_ebs_docker_host?ref=v11.0"

  hostname             = "nightbear-hosting-${var.color}"
  ssh_private_key_path = "terraform.id_rsa"
  ssh_public_key_path  = "terraform.id_rsa.pub"
  data_volume_id       = "${aws_ebs_volume.this.id}"

  tags = {
    Nightbear_Component   = "hosting"
    Nightbear_Environment = "mixed"
  }
}

resource "aws_security_group_rule" "this" {
  security_group_id = "${module.docker_host.security_group_id}"
  type              = "ingress"
  from_port         = 50000
  to_port           = 50100
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
}

module "docker_compose" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/docker_compose_host#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v11.0...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//docker_compose_host?ref=v11.0"

  public_ip       = "${module.docker_host.public_ip}"
  ssh_username    = "${module.docker_host.ssh_username}"
  ssh_private_key = "${module.docker_host.ssh_private_key}"

  docker_compose_yml = <<EOF
version: "3"

services:

  db_prod:
    image: couchdb:2.3.1
    restart: always
    ports:
      - "${var.port_map["db-prod"]}:5984"
    environment:
      COUCHDB_USER: admin
      COUCHDB_PASSWORD: ${var.couchdb_admin_password}
    volumes:
      - /data/db_prod:/opt/couchdb/data

  db_stage:
    image: couchdb:2.3.1
    restart: always
    ports:
      - "${var.port_map["db-stage"]}:5984"
    environment:
      COUCHDB_USER: admin
      COUCHDB_PASSWORD: ${var.couchdb_admin_password}
    volumes:
      - /data/db_stage:/opt/couchdb/data

  legacy:
    build: legacy/server
    restart: always
    ports:
      - "${var.port_map["legacy"]}:3001"
    environment:
      - NODE_ENV=production
      - DB_URL=https://admin:${var.couchdb_admin_password}@db-prod.nightbear.fi/legacy
      - PAPERTRAIL_URL=${var.papertrail_host_legacy}
      - PAPERTRAIL_LEVEL=info
      - PUSHOVER_USER=${var.pushover_user}
      - PUSHOVER_TOKEN=${var.pushover_token}
      - PUSHOVER_LEVEL_0=bear-phone
      - PUSHOVER_LEVEL_1=marjan_iphone
      - PUSHOVER_LEVEL_2=jrwNexus5
      - PUSHOVER_LEVEL_3=bear-phone
      - QUERY_THROTTLE_MS=1000
EOF
}

data "aws_route53_zone" "this" {
  name = "nightbear.fi"
}

resource "aws_route53_record" "this" {
  zone_id = "${data.aws_route53_zone.this.zone_id}"
  name    = "hosting-${var.color}.nightbear.fi"
  type    = "A"
  ttl     = 300
  records = ["${module.docker_host.public_ip}"]
}
