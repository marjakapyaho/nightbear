variable "siren_ui_password" {
  description = "HTTP Basic Auth password required to access the Siren UI"
}

module "aws_static_site" {
  # Check for updates at: https://github.com/futurice/terraform-utils/compare/v7.0...master
  source = "git::ssh://git@github.com/futurice/terraform-utils.git//aws_static_site?ref=v7.0"

  site_domain = "siren.nightbear.fi"

  basic_auth_username = "nightbear"
  basic_auth_password = "${var.siren_ui_password}"
}

resource "aws_s3_bucket_object" "index_html" {
  bucket       = "${module.aws_static_site.bucket_name}"
  key          = "index.html"
  source       = "${path.module}/../../contrib/siren-ui/index.html"
  etag         = "${filemd5("${path.module}/../../contrib/siren-ui/index.html")}"
  content_type = "text/html; charset=utf-8"
}

resource "aws_s3_bucket_object" "index_js" {
  bucket       = "${module.aws_static_site.bucket_name}"
  key          = "index.js"
  source       = "${path.module}/../../contrib/siren-ui/index.js"
  etag         = "${filemd5("${path.module}/../../contrib/siren-ui/index.js")}"
  content_type = "application/javascript"
}

resource "aws_s3_bucket_object" "index_css" {
  bucket       = "${module.aws_static_site.bucket_name}"
  key          = "index.css"
  source       = "${path.module}/../../contrib/siren-ui/index.css"
  etag         = "${filemd5("${path.module}/../../contrib/siren-ui/index.css")}"
  content_type = "text/css"
}

resource "aws_s3_bucket_object" "siren_mp3" {
  bucket       = "${module.aws_static_site.bucket_name}"
  key          = "siren.mp3"
  source       = "${path.module}/../../contrib/siren-ui/siren.mp3"
  etag         = "${filemd5("${path.module}/../../contrib/siren-ui/siren.mp3")}"
  content_type = "audio/mpeg3"
}
