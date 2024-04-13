# Create the VPC itself
resource "aws_vpc" "this" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = var.name_prefix
  }
}

# Figure out the availability zones within the current region
data "aws_availability_zones" "this" {
  state = "available"
}

# Private subnets (running RDS entirely within the free tier requires this, for instance)
resource "aws_subnet" "this" {
  count                   = length(data.aws_availability_zones.this.names) # create a subnet for each AZ
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.${count.index + 1}.0/24" # sequential blocks for each subnet (e.g. 10.0.1.***, 10.0.2.***, ...)
  availability_zone       = data.aws_availability_zones.this.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.name_prefix}-private-${count.index + 1}"
  }
}
