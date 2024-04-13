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

# So that our public subnets can reach the internet
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.name_prefix}-internet-gateway"
  }
}

# Allow routing traffic to internet via the gateway
resource "aws_route_table" "internet" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "${var.name_prefix}-route-to-internet"
  }
}

# Private subnets (running RDS entirely within the free tier requires one, for instance)
resource "aws_subnet" "private" {
  count                   = length(data.aws_availability_zones.this.names) # create a subnet for each AZ
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.${count.index + 1}.0/24" # sequential blocks for each subnet (e.g. 10.0.1.***, 10.0.2.***, ...)
  availability_zone       = data.aws_availability_zones.this.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.name_prefix}-private-${count.index + 1}"
  }
}

# Public subnets (running a bastion host requires one, for instance)
resource "aws_subnet" "public" {
  count                   = length(data.aws_availability_zones.this.names) # create a subnet for each AZ
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.0.${5 + count.index + 1}.0/24" # sequential blocks for each subnet (e.g. 10.0.5.***, 10.0.6.***, ...)
  availability_zone       = data.aws_availability_zones.this.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.name_prefix}-public-${count.index + 1}"
  }
}

# Allow routing traffic to internet from the public subnets
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public) # using for_each & aws_subnet.public would be nicer, but would require -target on creation
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.internet.id
}
