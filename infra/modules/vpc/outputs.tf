output "vpc_id" {
  value = aws_vpc.this.id
}

output "subnet_ids" {
  value = {
    private = aws_subnet.private[*].id
    public  = aws_subnet.public[*].id
  }
}

output "cidr_block" {
  value = aws_vpc.this.cidr_block
}
