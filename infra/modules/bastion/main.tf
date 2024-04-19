locals {
  hostname             = var.name_prefix
  ssh_private_key_path = "terraform.id_rsa"
  ssh_public_key_path  = "terraform.id_rsa.pub"
  ssh_username         = "ubuntu"
  instance_type        = "t2.micro"              # included in free tier
  instance_ami         = "ami-0786f5bc3943ad52d" # Ubuntu 22.04 LTS (eu-west-1, amd64, hvm:ebs-ssd); see https://cloud-images.ubuntu.com/locator/ec2/
}

# Create the EC2 instance
resource "aws_instance" "this" {
  instance_type          = local.instance_type
  ami                    = local.instance_ami
  key_name               = aws_key_pair.this.id # the name of the SSH keypair to use for provisioning
  vpc_security_group_ids = [aws_security_group.this.id]
  subnet_id              = var.network.subnet_ids.public[0] # need to be in a public subnet to be reachable

  connection {
    host        = coalesce(self.public_ip, self.private_ip)
    type        = "ssh"
    user        = local.ssh_username
    private_key = file(local.ssh_private_key_path)
    agent       = false # don't use SSH agent because we have the private key right here
  }

  provisioner "remote-exec" {
    inline = [
      "sudo hostnamectl set-hostname ${local.hostname}",
      "echo 127.0.0.1 ${local.hostname} | sudo tee -a /etc/hosts", # https://askubuntu.com/a/59517
    ]
  }
}
