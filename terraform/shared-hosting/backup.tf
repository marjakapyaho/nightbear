data "aws_region" "backup" {}

locals {
  name = "nightbear-fi---hosting-backup"
}

resource "aws_s3_bucket" "backup" {
  bucket = "${local.name}"
  acl    = "private"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    enabled = true

    # When the backup is older than a day, move it to Glacier
    noncurrent_version_transition {
      days          = 1
      storage_class = "GLACIER"
    }

    # When it's older than a year, remove it (though the latest one never expires)
    noncurrent_version_expiration {
      days = 365
    }
  }

  tags = {
    Nightbear_Component   = "hosting"
    Nightbear_Environment = "mixed"
  }
}

resource "aws_iam_user" "backup" {
  name = "${local.name}"
}

resource "aws_iam_access_key" "backup" {
  user = "${aws_iam_user.backup.name}"
}

resource "aws_iam_user_policy" "backup" {
  name = "${local.name}"
  user = "${aws_iam_user.backup.name}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::${aws_s3_bucket.backup.id}",
        "arn:aws:s3:::${aws_s3_bucket.backup.id}/*"
      ]
    }
  ]
}
EOF
}

locals {
  backup_config = {
    AWS_S3_BUCKET_NAME    = "${aws_s3_bucket.backup.id}"
    AWS_ACCESS_KEY_ID     = "${aws_iam_access_key.backup.id}"
    AWS_SECRET_ACCESS_KEY = "${aws_iam_access_key.backup.secret}"
    AWS_DEFAULT_REGION    = "${data.aws_region.backup.name}"
  }
}
