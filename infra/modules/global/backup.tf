# Random, non-automated backups we want to keep just in case
resource "aws_s3_bucket" "manual_backup" {
  bucket = "${var.name_prefix}-manual-backup"
  acl    = "private"

  lifecycle_rule {
    id      = "Move to Glacier after 1 day"
    enabled = true

    # When the backup is older than a day, move it to Glacier
    transition {
      days          = 1
      storage_class = "GLACIER"
    }
  }
}
