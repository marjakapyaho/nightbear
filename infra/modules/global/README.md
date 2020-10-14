# Nightbear infra/global

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

## Reprovisioning hosting

If the host is FUBAR, sometimes it's easiest to just throw it away and build a new one. All persistent data is on a separate EBS volume, so this should always be safe.

If the host is still responsive, you can make sure the EBS volume is unattached cleanly with:

    ssh -i terraform.id_rsa -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ubuntu@hosting.nightbear.fi sudo poweroff

Wait a few minutes to make doubly sure.

Taint and recreate the host:

    terraform taint module.global.module.docker_host.aws_instance.this
    terraform apply -target module.global.module.docker_host.aws_instance.this

If needed, you can immediately SSH over with:

    ssh -i terraform.id_rsa ubuntu@$(terraform state show -no-color module.global.module.docker_host.aws_instance.this | grep ' public_ip ' | cut -d '"' -f 2)

This also works between any of the subsequent steps, if manual intervention (e.g. restoring from backups) is needed.

Next, check which provisioners exist for the host:

    terraform state list | grep module.global | grep null_resource

These need to be re-run manually, and (mostly) in the correct order.

Make a shell helper for this:

    function remove-and-recreate {
      terraform state rm $1
      terraform apply -target $1
    }

And then proceed with:

    remove-and-recreate module.global.module.docker_host.null_resource.provisioners[0] # EBS volume attachment
    remove-and-recreate module.global.null_resource.patches
    remove-and-recreate module.global.null_resource.telegraf_conf
    remove-and-recreate module.global.null_resource.unattended_upgrades
    remove-and-recreate module.global.module.docker_compose.null_resource.provisioners # Start Docker services

Issue a final `terraform apply` to ensure everything is up to spec.

## Logging

Logs are sent to Papertrail, but only some of them, because we pay by the MB.

All logs are available locally with e.g. `docker-compose logs`.

# Restoring from backup

As the saying goes, if you never try restoring your backups... you don't have backups. So here goes:

    aws s3 cp s3://nightbear-global-hosting-backup/latest.tar.gz .
    tar -xf latest.tar.gz
    docker run -p 5984:5984 -v $(pwd)/db:/opt/couchdb/data couchdb:2.3.1

Open up http://localhost:5984/_utils and take a look around to see if the latest data is there
