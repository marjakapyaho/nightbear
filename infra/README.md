# Nightbear infra

## SSH keys for provisioning

The infra expects `infra/terraform.id_rsa` and `infra/terraform.id_rsa.pub` to exist, and will use them as SSH public/private key pair when setting up infrastructure that requires provisioning over SSH.

It means you need to do the same if you want to SSH over to the hosting:

    ssh -i infra/terraform.id_rsa -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ubuntu@hosting.nightbear.fi

Alternatively, you can add to `~/.ssh/config`:

    Host nightbear-global-hosting
        HostName hosting.nightbear.fi
        User ubuntu
        IdentityFile /path/to/nightbear/infra/terraform.id_rsa
        StrictHostKeyChecking no
        UserKnownHostsFile /dev/null

...and then simply:

    ssh nightbear-global-hosting
