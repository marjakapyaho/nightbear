#!/bin/bash

set -euo pipefail # exit on error; treat unset variables as errors; exit on errors in piped commands

echo "This will re-create hosting.nightbear.fi from scratch. Continue?"
read
set -x
sleep 5

# Note: The presence of the DEBUG env var messes with Terraform (https://github.com/tfutils/tfenv/issues/210) -> unset it

# Taint and recreate the host:
DEBUG= terraform taint module.global.module.docker_host.aws_instance.this
DEBUG= terraform apply -auto-approve -target module.global.module.docker_host.aws_instance.this

# At any point after this, you can SSH over with: ssh -i terraform.id_rsa ubuntu@$(terraform state show -no-color module.global.module.docker_host.aws_instance.this | grep ' public_ip ' | cut -d '"' -f 2)

# Re-run provisioners:
function remove-and-recreate {
  DEBUG= terraform state rm $1
  DEBUG= terraform apply -auto-approve -target $1
}
remove-and-recreate module.global.module.docker_host.null_resource.provisioners[0] # EBS volume attachment
remove-and-recreate module.global.null_resource.hosting_initial_setup
remove-and-recreate module.global.null_resource.telegraf_conf
remove-and-recreate module.global.null_resource.promtail_config
remove-and-recreate module.global.module.docker_compose.null_resource.provisioners # Start Docker services

# Update DNS records:
resources="$(terraform state list | grep module.global.aws_route53_record.hosting)"
targets="$(echo $resources | sed -E 's/(^| )/ -target /g')"
terraform apply -auto-approve $targets

# This will help the domain to resolve to its new IP immediately:
echo "Enter password to flush DNS cache (hosting IP has changed)"
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
