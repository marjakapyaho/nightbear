# https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = ["${var.cloudfront_static_site_domain_name}"]
  price_class         = "PriceClass_100"

  origin {
    domain_name = "${module.public_s3_bucket.public_s3_bucket_domain_name}"
    origin_id   = "${var.cloudfront_static_site_domain_name}"
    origin_path = ""
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.cloudfront_static_site_domain_name}"
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0                                           # default is 0
    default_ttl            = "${var.cloudfront_static_site_cache_ttl}"   # default is 86400 (i.e. one day)
    max_ttl                = "${var.cloudfront_static_site_cache_ttl}"   # default is 31536000 (i.e. one year)
    compress               = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html#viewer-certificate-arguments
  viewer_certificate {
    acm_certificate_arn      = "${aws_acm_certificate_validation.this.certificate_arn}"
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.1_2016"
  }
}

# https://www.terraform.io/docs/providers/aws/r/acm_certificate.html
resource "aws_acm_certificate" "this" {
  provider          = "aws.acm_provider"                          # because ACM needs to be used in the "us-east-1" region
  domain_name       = "${var.cloudfront_static_site_domain_name}"
  validation_method = "DNS"
}

resource "aws_route53_record" "cert_validation" {
  name    = "${aws_acm_certificate.this.domain_validation_options.0.resource_record_name}"
  type    = "${aws_acm_certificate.this.domain_validation_options.0.resource_record_type}"
  zone_id = "${var.cloudfront_static_site_domain_zone}"
  records = ["${aws_acm_certificate.this.domain_validation_options.0.resource_record_value}"]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "this" {
  provider                = "aws.acm_provider"                             # because ACM needs to be used in the "us-east-1" region
  certificate_arn         = "${aws_acm_certificate.this.arn}"
  validation_record_fqdns = ["${aws_route53_record.cert_validation.fqdn}"]
}
