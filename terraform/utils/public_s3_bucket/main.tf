variable "public_bucket_name" {
  description = "Globally unique name to reserve for the bucket"
}

output "public_bucket_ssl_endpoint" {
  description = "Full URL for the HTTPS endpoint for accessing the bucket"
  value       = "https://s3.${data.aws_region.this.name}.amazonaws.com/${aws_s3_bucket.this.id}/"
}

# https://www.terraform.io/docs/providers/aws/d/region.html
data "aws_region" "this" {}

# https://www.terraform.io/docs/providers/aws/r/s3_bucket.html
resource "aws_s3_bucket" "this" {
  bucket = "${var.public_bucket_name}"

  # https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl
  acl = "public-read"

  website {
    index_document = "index.html" # note, though, that when accessing the bucket over the SSL endpoint (public_bucket_ssl_endpoint), the index_document will not be used
  }
}

# https://www.terraform.io/docs/providers/aws/r/s3_bucket_policy.html
resource "aws_s3_bucket_policy" "this" {
  bucket = "${aws_s3_bucket.this.id}"

  # https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-2
  policy = <<EOF
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"AddPerm",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::${aws_s3_bucket.this.id}/*"]
    }
  ]
}
EOF
}
