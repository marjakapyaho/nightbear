# Nightbear infra/global

## Analyzing disk usage

`apt install ncdu` and you're done.

## Removing old logs

...from an Ubuntu Docker host:

`sudo journalctl --vacuum-size=50M` (leave only the last 50 MB's worth of logs)

## First time setup

Due to an annoying dependency graph, you need to first:

    terraform apply -target module.global.aws_ebs_volume.data

Then comment out the `module "docker_compose"` in `infra/modules/global/hosting.tf`, and:

    terraform apply

Comment `module "docker_compose"` back in, and:

    terraform apply

When the infra is up, you need to finish by SSH'ing over to the host:

    ssh -i terraform.id_rsa -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ubuntu@hosting.nightbear.fi
    source post-provision-setup.sh

This will leave you with an empty but configured DB server, etc.

## Reprovisioning

If the host is FUBAR, sometimes it's easiest to just throw it away and build a new one. All persistent data is on a separate EBS volume, so this should always be safe.

This assumes the host is already in a non-responsive state, meaning Terraform providers for e.g. Grafana & InfluxDB won't be able to talk to services running on the host.

This process is now fully automated with `./reprovision.sh`.

## Logging

Logs are sent to Papertrail, but only some of them, because we pay by the MB.

All logs are available locally with e.g. `docker-compose logs`.

# Restoring from backup

As the saying goes, if you never try restoring your backups... you don't have backups. So here goes:

    aws s3 cp s3://nightbear-global-hosting-backup/latest.tar.gz .
    tar -xf latest.tar.gz
    docker run -p 5984:5984 -v $(pwd)/backup/couchdb-data:/opt/couchdb/data couchdb:2.3.1

Open up http://localhost:5984/_utils and take a look around to see if the latest data is there
