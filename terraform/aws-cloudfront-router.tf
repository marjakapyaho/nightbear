variable "router_domain_name" {
  # https://aws.amazon.com/premiumsupport/knowledge-center/resolve-cnamealreadyexists-error/
  default = "router-new.nightbear.fi"
}

# https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html
resource "aws_cloudfront_distribution" "router_distribution" {
  enabled             = true
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
      origin_protocol_policy = "match-viewer"
      origin_ssl_protocols   = [ "TLSv1", "TLSv1.1", "TLSv1.2" ]
    }
  }

  default_cache_behavior {
    allowed_methods        = [ "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT" ]
    cached_methods         = [ "GET", "HEAD" ]
    target_origin_id       = "NightbearRouter"
    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400

    forwarded_values {
      query_string = true
      headers      = [ "*" ]

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

  viewer_certificate {
    cloudfront_default_certificate = true
    ssl_support_method             = "sni-only"
  }
}
