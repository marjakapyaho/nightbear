# https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = ""
  aliases             = ["${var.cloudfront_apigw_lambda_domain_name}"]
  price_class         = "PriceClass_100"

  origin {
    # Sadly, the aws_api_gateway_deployment resource doesn't export this value on its own
    # e.g. "https://abcdefg.execute-api.eu-central-1.amazonaws.com/default" => "abcdefg.execute-api.eu-central-1.amazonaws.com"
    domain_name = "${replace(aws_api_gateway_deployment.this.invoke_url, "/^.*\\/\\/(.*)\\/.*$/", "$1")}"

    origin_id   = "${var.cloudfront_apigw_cloudfront_function_name}"
    origin_path = "/${var.cloudfront_apigw_cloudfront_stage_name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.cloudfront_apigw_cloudfront_function_name}"
    viewer_protocol_policy = "allow-all"

    # TODO: https://github.com/terraform-providers/terraform-provider-aws/issues/1994
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
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
  provider          = "aws.acm_provider"                           # because ACM needs to be used in the "us-east-1" region
  domain_name       = "${var.cloudfront_apigw_lambda_domain_name}"
  validation_method = "DNS"
}

resource "aws_route53_record" "cert_validation" {
  name = "${aws_acm_certificate.this.domain_validation_options.0.resource_record_name}"
  type = "${aws_acm_certificate.this.domain_validation_options.0.resource_record_type}"

  zone_id = "${var.cloudfront_apigw_lambda_domain_zone}"
  records = ["${aws_acm_certificate.this.domain_validation_options.0.resource_record_value}"]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "this" {
  provider                = "aws.acm_provider"                             # because ACM needs to be used in the "us-east-1" region
  certificate_arn         = "${aws_acm_certificate.this.arn}"
  validation_record_fqdns = ["${aws_route53_record.cert_validation.fqdn}"]
}
