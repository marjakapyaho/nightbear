resource "aws_s3_bucket" "terraform_state" {
  bucket = "nightbear-infra-terraform-state-next" # at the time of writing, "nightbear-infra-terraform-state" is reserved by the previous infra, and bucket names are global
}

resource "aws_dynamodb_table" "terraform_lock" {
  name         = "nightbear-infra-terraform-lock"
  hash_key     = "LockID"
  billing_mode = "PAY_PER_REQUEST" # i.e. pay-as-you-go, instead of provisioned capacity

  attribute {
    name = "LockID"
    type = "S"
  }
}

# Note: Terraform doesn't allow variable interpolations here
terraform {
  backend "s3" {
    bucket         = "nightbear-infra-terraform-state-next"
    key            = "terraform"
    dynamodb_table = "nightbear-infra-terraform-lock"
  }
}
