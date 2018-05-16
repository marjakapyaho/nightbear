module "public_s3_bucket" {
  source                = "../public_s3_bucket"
  public_s3_bucket_name = "${var.cloudfront_static_site_bucket_prefix}${replace("${var.cloudfront_static_site_domain_name}", "/\\./", "-")}" # replace dots with dashes so we don't get issues with S3 bucket domains
}

resource "aws_route53_record" "this" {
  zone_id = "${var.cloudfront_static_site_domain_zone}"
  name    = "${var.cloudfront_static_site_domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["${aws_cloudfront_distribution.this.domain_name}"]
}
