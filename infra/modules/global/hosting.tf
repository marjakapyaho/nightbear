locals {
  hostname                 = "${var.name_prefix}-hosting"
  unattended_upgrades_file = "/etc/apt/apt.conf.d/51unattended-upgrades-custom"
  auth_username            = "nightbear"
  auth_password            = var.secrets.http_auth_password
  metrics_host             = "influxdb.jrw.fi"
  metrics_username         = "writer"
  metrics_password         = var.secrets.influxdb_password_writer
}

resource "aws_ebs_volume" "data" {
  availability_zone = module.docker_host.availability_zone # ensure the volume is created in the same AZ the docker host
  type              = "gp2"                                # i.e. "Amazon EBS General Purpose SSD"
  size              = 32                                   # in GiB; if you change this in-place, you need to SSH over and run e.g. $ sudo resize2fs /dev/xvdh

  tags = merge(var.tags, {
    Component = "hosting"
    Name      = local.hostname # give the data volume a name that makes it easier to identify as belonging to this host
  })
}

module "docker_host" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/aws_ec2_ebs_docker_host#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v13.1...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_ec2_ebs_docker_host?ref=v13.1"

  hostname             = local.hostname
  instance_ami         = "ami-0c4c42893066a139e" # Ubuntu 20.04 LTS (eu-west-1, amd64, hvm:ebs-ssd, 2020-09-24); see https://cloud-images.ubuntu.com/locator/ec2/
  ssh_private_key_path = "terraform.id_rsa"
  ssh_public_key_path  = "terraform.id_rsa.pub"
  root_volume_size     = 12 # GB
  data_volume_id       = aws_ebs_volume.data.id
  tags                 = merge(var.tags, { Component = "hosting" })
  allow_incoming_http  = true # by default, only incoming SSH is allowed; other protocols for the security group are opt-in
  allow_incoming_https = true
}

resource "null_resource" "hosting_initial_setup" {
  depends_on = [module.docker_host] # wait until other provisioners within the module have finished

  connection {
    host        = module.docker_host.public_ip
    user        = module.docker_host.ssh_username
    private_key = module.docker_host.ssh_private_key
    agent       = false
  }

  provisioner "remote-exec" {
    inline = [
      <<-EOF
        echo '
        Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
        Unattended-Upgrade::Remove-Unused-Dependencies "true";
        Unattended-Upgrade::Automatic-Reboot "true";
        Unattended-Upgrade::Automatic-Reboot-Time "13:00";
        ' | sudo tee ${local.unattended_upgrades_file}
      EOF
    ]
  }

  provisioner "file" {
    source      = "${path.module}/hosting-nginx.tmpl"
    destination = "/home/${module.docker_host.ssh_username}/nginx.tmpl"
  }

  provisioner "remote-exec" {
    inline = [
      # Move patched (https://github.com/nginx-proxy/nginx-proxy/pull/1176) nginx config template into place:
      "sudo mv nginx.tmpl /data",

      # Fix default 1 MB body size limit (replication needs more):
      "echo 'client_max_body_size 500m;' | sudo tee /data/nginx-extras.conf",

      # Generate nginx htpasswd files:
      "docker run --rm --entrypoint /bin/sh xmartlabs/htpasswd -c \"htpasswd -bn ${local.auth_username} ${local.auth_password}\" | sudo tee /data/nginx-htpasswd/db.nightbear.fi",

      # Check out "master" as the "stage" env codebase:
      "git clone https://github.com/marjakapyaho/nightbear.git server-stage",

      # Check out the latest tag (hopefully a release) as the prod codebase:
      "git clone https://github.com/marjakapyaho/nightbear.git server-prod",
      "cd server-prod && git checkout $(git describe --tags | cut -d - -f 1)"
    ]
  }

  provisioner "file" {
    destination = "/home/${module.docker_host.ssh_username}/post-provision-setup.sh"
    content     = <<-EOF
      #!/bin/bash

      # Configure CouchDB server:
      docker-compose exec couchdb curl -X POST -H Content-Type:application/json http://${local.auth_username}:${local.auth_password}@localhost:5984/_cluster_setup -d '{"action":"enable_single_node","username":"${local.auth_username}","password":"${local.auth_password}","bind_address":"0.0.0.0","port":5984,"singlenode":true}'
      docker-compose exec couchdb curl -X PUT -H Content-Type:application/json http://${local.auth_username}:${local.auth_password}@localhost:5984/_node/nonode@nohost/_config/httpd/enable_cors -d '"true"'
      docker-compose exec couchdb curl -X PUT -H Content-Type:application/json http://${local.auth_username}:${local.auth_password}@localhost:5984/_node/nonode@nohost/_config/cors/origins -d '"*"'
      docker-compose exec couchdb curl -X PUT -H Content-Type:application/json http://${local.auth_username}:${local.auth_password}@localhost:5984/_node/nonode@nohost/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
      docker-compose exec couchdb curl -X PUT -H Content-Type:application/json http://${local.auth_username}:${local.auth_password}@localhost:5984/_node/nonode@nohost/_config/cors/credentials -d '"true"'
      docker-compose exec couchdb curl -X PUT -H Content-Type:application/json http://${local.auth_username}:${local.auth_password}@localhost:5984/_node/nonode@nohost/_config/cors/headers -d '"accept, authorization, content-type, origin, referer"'
      docker-compose exec couchdb curl -X PUT -H Content-Type:application/json http://${local.auth_username}:${local.auth_password}@localhost:5984/_node/nonode@nohost/_config/couch_httpd_auth/timeout -d '"31556952"' # i.e. one year
      docker-compose exec couchdb curl -X PUT -H Content-Type:application/json http://${local.auth_username}:${local.auth_password}@localhost:5984/_node/nonode@nohost/_config/log/level -d '"warning"'
    EOF
  }
}

locals {
  telegraf_conf = <<-EOF

    [agent]
      interval = "60s" # Default data collection interval for all inputs
      collection_jitter = "3s" # Collection jitter is used to jitter the collection by a random amount.
      flush_jitter = "3s" # Jitter the flush interval by a random amount. This is primarily to avoid large write spikes for users running a large number of telegraf instances.

    [[outputs.influxdb]]
      urls = ["https://${local.metrics_host}"] # The full HTTP or UDP URL for your InfluxDB instance.
      username = "${local.metrics_username}"
      password = "${local.metrics_password}"

    [[inputs.disk]]
      ignore_fs = ["tmpfs", "devtmpfs", "devfs", "iso9660", "overlay", "aufs", "squashfs"] # Ignore FS types that probably aren't very interesting

    [[inputs.cpu]]
    [[inputs.diskio]]
    [[inputs.kernel]]
    [[inputs.mem]]
    [[inputs.processes]]
    [[inputs.swap]]
    [[inputs.system]]
    [[inputs.docker]]
    [[inputs.net]]

  EOF
}

resource "null_resource" "telegraf_conf" {
  depends_on = [module.docker_host]                    # wait until other provisioners within the module have finished
  triggers   = { telegraf_conf = local.telegraf_conf } # re-run if the config changes

  connection {
    host        = module.docker_host.public_ip
    user        = module.docker_host.ssh_username
    private_key = module.docker_host.ssh_private_key
    agent       = false
  }

  # Create/update remote Telegraf config file
  # https://github.com/influxdata/telegraf/blob/master/docs/CONFIGURATION.md
  provisioner "file" {
    destination = "/home/${module.docker_host.ssh_username}/telegraf.conf"
    content     = local.telegraf_conf
  }

  # Let Telegraf know the config might've changed
  provisioner "remote-exec" {
    inline = ["docker restart telegraf && echo 'Successfully restarted Telegraf with new config' || echo 'Telegraf not running, no need to restart'"]
  }
}

module "docker_compose" {
  # Available inputs: https://github.com/futurice/terraform-utils/tree/master/docker_compose_host#inputs
  # Check for updates: https://github.com/futurice/terraform-utils/compare/v13.0...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//docker_compose_host?ref=v13.0"

  public_ip       = module.docker_host.public_ip
  ssh_username    = module.docker_host.ssh_username
  ssh_private_key = module.docker_host.ssh_private_key

  docker_compose_yml = <<EOF
version: "3"

services:

  # https://github.com/nginx-proxy/nginx-proxy/
  nginx:
    container_name: nginx
    image: jwilder/nginx-proxy
    restart: always
    ports:
      - 80:80
      - 443:443
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - /data/nginx-certs:/etc/nginx/certs:ro
      - /data/nginx-data:/etc/nginx/vhost.d
      - /data/nginx-data:/usr/share/nginx/html
      - /data/nginx-htpasswd:/etc/nginx/htpasswd:ro
      - /data/nginx-extras.conf:/etc/nginx/conf.d/nginx-extras.conf:ro
      - /data/nginx.tmpl:/app/nginx.tmpl
    labels:
      - com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy=true

  # https://github.com/nginx-proxy/docker-letsencrypt-nginx-proxy-companion
  letsencrypt:
    container_name: letsencrypt
    image: jrcs/letsencrypt-nginx-proxy-companion
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /data/nginx-certs:/etc/nginx/certs:rw
      - /data/nginx-data:/etc/nginx/vhost.d
      - /data/nginx-data:/usr/share/nginx/html

  # https://hub.docker.com/_/couchdb
  couchdb:
    container_name: couchdb
    image: couchdb:2.3.1
    restart: always
    environment:
      - COUCHDB_USER=${local.auth_username}
      - COUCHDB_PASSWORD=${local.auth_password}
      - LETSENCRYPT_EMAIL=admin@nightbear.fi
      - LETSENCRYPT_HOST=db.nightbear.fi
      - VIRTUAL_HOST=db.nightbear.fi
      - VIRTUAL_PORT=5984
    volumes:
      - /data/couchdb-data:/opt/couchdb/data
      - /data/couchdb-conf:/opt/couchdb/etc/local.d

  # https://github.com/marjakapyaho/nightbear
  server_stage:
    container_name: server-stage
    image: node:12.19.0
    working_dir: /app
    command: bash -c 'npm install && npm run server-start'
    restart: always
    expose:
      - 3000
    environment:
      - NIGHTBEAR_DB_URL=http://couchdb:5984/stage
      - DEXCOM_SHARE_USERNAME=${var.secrets.dexcom_share_username}
      - DEXCOM_SHARE_PASSWORD=${var.secrets.dexcom_share_password}
      - PUSHOVER_USER=TODO
      - PUSHOVER_TOKEN=TODO
      - PUSHOVER_CALLBACK=TODO
      - DEBUG=nightbear*
      - DEBUG_COLORS=1
      - DEBUG_HIDE_DATE=1
      - LETSENCRYPT_EMAIL=admin@nightbear.fi
      - LETSENCRYPT_HOST=server.stage.nightbear.fi
      - VIRTUAL_HOST=server.stage.nightbear.fi
      - VIRTUAL_PORT=3000
    volumes:
      - ./server-stage:/app
    labels:
      - send-logs-to-papertrail=true

  # https://github.com/marjakapyaho/nightbear
  server_prod:
    container_name: server-prod
    image: node:12.19.0
    working_dir: /app
    command: bash -c 'npm install && npm run server-start'
    restart: always
    expose:
      - 3000
    environment:
      - NIGHTBEAR_DB_URL=http://couchdb:5984/prod
      - DEXCOM_SHARE_USERNAME=${var.secrets.dexcom_share_username}
      - DEXCOM_SHARE_PASSWORD=${var.secrets.dexcom_share_password}
      - PUSHOVER_USER=${var.secrets.pushover_user}
      - PUSHOVER_TOKEN=${var.secrets.pushover_token}
      - PUSHOVER_CALLBACK=https://server.nightbear.fi/ack-latest-alarm
      - DEBUG=nightbear*
      - DEBUG_COLORS=1
      - DEBUG_HIDE_DATE=1
      - LETSENCRYPT_EMAIL=admin@nightbear.fi
      - LETSENCRYPT_HOST=server.nightbear.fi
      - VIRTUAL_HOST=server.nightbear.fi
      - VIRTUAL_PORT=3000
    volumes:
      - ./server-prod:/app
    labels:
      - send-logs-to-papertrail=true

  # https://github.com/gliderlabs/logspout
  logspout:
    container_name: logspout
    image: gliderlabs/logspout:v3.2.11
    restart: always
    command: syslog+tls://${var.secrets.papertrail_host_hosting}?filter.labels=send-logs-to-papertrail:true # by default, container logs aren't shipped off host, because logging costs money; add "send-logs-to-papertrail=true" label to any container to include it
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - SYSLOG_HOSTNAME=${module.docker_host.hostname}

  # https://hub.docker.com/_/telegraf
  telegraf:
    container_name: telegraf
    image: telegraf:1.13.4
    restart: always
    hostname: ${module.docker_host.hostname}
    environment:
      # From https://github.com/influxdata/telegraf/blob/master/docs/FAQ.md
      - HOST_ETC=/hostfs/etc
      - HOST_PROC=/hostfs/proc
      - HOST_SYS=/hostfs/sys
      - HOST_MOUNT_PREFIX=/hostfs
    volumes:
      - ./telegraf.conf:/etc/telegraf/telegraf.conf:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      # From https://github.com/influxdata/telegraf/blob/master/docs/FAQ.md
      - /:/hostfs:ro
      - /etc:/hostfs/etc:ro
      - /proc:/hostfs/proc:ro
      - /sys:/hostfs/sys:ro
      - /var/run/utmp:/var/run/utmp:ro

  # https://github.com/futurice/docker-volume-backup
  backup:
    container_name: backup
    image: futurice/docker-volume-backup:2.1.0
    restart: always
    hostname: ${module.docker_host.hostname}
    environment:
      - BACKUP_CRON_EXPRESSION=00 01 * * * # run backup at 3 or 4 AM every night, Finnish time
      - BACKUP_FILENAME=latest.tar.gz # because the bucket is versioned, we can always use the same file name
      - AWS_S3_BUCKET_NAME=${aws_s3_bucket.backup.id}
      - AWS_ACCESS_KEY_ID=${aws_iam_access_key.backup.id}
      - AWS_SECRET_ACCESS_KEY=${aws_iam_access_key.backup.secret}
      - AWS_DEFAULT_REGION=${data.aws_region.this.name}
      - INFLUXDB_URL=https://${local.metrics_host}
      - INFLUXDB_DB=misc
      - INFLUXDB_CREDENTIALS=${local.metrics_username}:${local.metrics_password}
      - INFLUXDB_MEASUREMENT=docker_host_backups
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro # allow Docker commands from within the container
      - /data:/backup:ro # mount the data path into the container, so it gets backed up
    labels:
      - send-logs-to-papertrail=true

  # https://github.com/grafana/loki/releases
  promtail:
    container_name: promtail
    image: grafana/promtail:2.2.1
    restart: always
    volumes:
      - ./promtail-config.yaml:/etc/promtail/config.yml:ro
      - ./promtail-data/:/tmp/promtail
      - /var/log:/var/log:ro
      - /run/log:/run/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro

EOF
}

resource "aws_route53_record" "hosting" {
  for_each = toset([
    "hosting.nightbear.fi",
    "db.nightbear.fi",
    "server.stage.nightbear.fi",
    "server.nightbear.fi",
  ])

  zone_id = aws_route53_zone.this.zone_id
  name    = each.value
  type    = "A"
  ttl     = 300
  records = [module.docker_host.public_ip]
}

# Backups for this host are stored in this bucket
resource "aws_s3_bucket" "backup" {
  bucket = "${module.docker_host.hostname}-backup"
  acl    = "private"

  # Enable versioning so we can just keep writing to the same file, without losing older backups
  versioning {
    enabled = true
  }

  lifecycle_rule {
    id      = "Move to Glacier after 1 day, remove old versions after 1 year"
    enabled = true

    # When the backup is older than a day, move it to Glacier
    transition {
      days          = 1
      storage_class = "GLACIER"
    }

    # When it's older than a year, remove it (though the latest one never expires)
    noncurrent_version_expiration {
      days = 365
    }
  }
}

# Create a separate IAM user for running the backups, which has access to the one backup bucket and nothing else
resource "aws_iam_user" "backup" {
  name = "${module.docker_host.hostname}-backup"
}

resource "aws_iam_access_key" "backup" {
  user = aws_iam_user.backup.name
}

resource "aws_iam_user_policy" "backup" {
  name = "${module.docker_host.hostname}-backup"
  user = aws_iam_user.backup.name
  policy = jsonencode(
    {
      Version : "2012-10-17",
      Statement : [
        {
          Effect : "Allow",
          Action : "s3:*",
          Resource : [
            "arn:aws:s3:::${aws_s3_bucket.backup.id}",
            "arn:aws:s3:::${aws_s3_bucket.backup.id}/*",
          ],
        },
      ],
  })
}

output "backup_bucket" {
  value = aws_s3_bucket.backup.id
}
