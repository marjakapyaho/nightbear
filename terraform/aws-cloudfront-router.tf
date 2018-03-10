variable "router_domain_name" {
  # https://aws.amazon.com/premiumsupport/knowledge-center/resolve-cnamealreadyexists-error/
  default = "router-new.nightbear.fi"
}

# https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html
resource "aws_cloudfront_distribution" "router_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = ""
  aliases             = [ "${var.router_domain_name}" ]
  price_class         = "PriceClass_100"

  origin {
    # Sadly, the aws_api_gateway_deployment provider doesn't export this value on its own
    # e.g. "https://abcdefg.execute-api.eu-central-1.amazonaws.com/default" => "abcdefg.execute-api.eu-central-1.amazonaws.com"
    domain_name = "${replace(aws_api_gateway_deployment.router_deployment.invoke_url, "/^.*\\/\\/(.*)\\/.*$/", "$1")}"
    origin_id   = "NightbearRouter"
    origin_path = "/${var.router_stage_name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = [ "TLSv1", "TLSv1.1", "TLSv1.2" ]
    }
  }

  default_cache_behavior {
    allowed_methods        = [ "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT" ]
    cached_methods         = [ "GET", "HEAD" ]
    target_origin_id       = "NightbearRouter"
    viewer_protocol_policy = "allow-all"
    # TODO: https://github.com/terraform-providers/terraform-provider-aws/issues/1994
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400

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
    acm_certificate_arn      = "${aws_acm_certificate_validation.router_cert_validation.certificate_arn}"
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.1_2016"
  }
}

# https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html
# "To use an ACM Certificate with CloudFront, you must request or import the certificate in the US East (N. Virginia) region."
# https://www.terraform.io/docs/configuration/providers.html#multiple-provider-instances
provider "aws" {
  alias      = "acm_provider"
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-east-1"
}

# https://www.terraform.io/docs/providers/aws/r/acm_certificate.html
resource "aws_acm_certificate" "router_cert" {
  provider          = "aws.acm_provider" # because ACM needs to be used in the "us-east-1" region
  domain_name       = "${var.router_domain_name}"
  validation_method = "DNS"
}

resource "aws_route53_record" "router_cert_validation" {
  name    = "${aws_acm_certificate.router_cert.domain_validation_options.0.resource_record_name}"
  type    = "${aws_acm_certificate.router_cert.domain_validation_options.0.resource_record_type}"
  zone_id = "${aws_route53_zone.main.zone_id}"
  records = [ "${aws_acm_certificate.router_cert.domain_validation_options.0.resource_record_value}" ]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "router_cert_validation" {
  provider                = "aws.acm_provider" # because ACM needs to be used in the "us-east-1" region
  certificate_arn         = "${aws_acm_certificate.router_cert.arn}"
  validation_record_fqdns = [ "${aws_route53_record.router_cert_validation.fqdn}" ]
}
