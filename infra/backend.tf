# https://www.terraform.io/docs/providers/aws/r/s3_bucket.html
resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.name_prefix}-infra-terraform-state"
  tags   = var.tags

  versioning {
    enabled = true
  }
}

# https://www.terraform.io/docs/providers/aws/r/dynamodb_table.html
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "${var.name_prefix}-infra-terraform-lock"
  hash_key       = "LockID"
  read_capacity  = 20
  write_capacity = 20
  tags           = var.tags

  attribute {
    name = "LockID"
    type = "S"
  }
}

# https://www.terraform.io/docs/backends/types/s3.html
# IMPORTANT: Terraform doesn't allow variable interpolations here, so var.name_prefix needs to be hard-coded here
terraform {
  backend "s3" {
    bucket         = "nightbear-infra-terraform-state"
    key            = "terraform"
    dynamodb_table = "nightbear-infra-terraform-lock"
  }
}
