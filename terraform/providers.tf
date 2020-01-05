# Specify the provider and access details
provider "aws" {
  version    = "~> 2.4"
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "${var.aws_region}"
}

# https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html
# "To use an ACM Certificate with CloudFront, you must request or import the certificate in the US East (N. Virginia) region."
# https://www.terraform.io/docs/configuration/providers.html#multiple-provider-instances
provider "aws" {
  version    = "~> 2.4"
  alias      = "us_east_1"
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "us-east-1"
}

# https://www.terraform.io/docs/providers/mailgun/index.html
provider "mailgun" {
  version = "~> 0.1"
  api_key = "${var.mailgun_api_key}"
}

# As per best practices, pin provider versions:

provider "null" {
  version = "~> 2.1"
}

provider "archive" {
  version = "~> 1.2"
}

provider "template" {
  version = "~> 2.1"
}