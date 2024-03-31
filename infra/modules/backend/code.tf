locals {
  file = "code"
}

# Create a zip file with placeholder code, so we have something to create the Lambda with
data "archive_file" "lambda" {
  type                    = "zip"
  output_path             = "${path.module}/${local.file}.zip"
  source_content_filename = "${local.file}.js"
  source_content          = <<-EOF
    module.exports.handler = async () => {
      return {
        statusCode: 200,
        headers: {},
        body: 'PLACEHOLDER',
      };
    };
  EOF
}

# Code will be stored here
resource "aws_s3_bucket" "lambda" {
  bucket = "${var.name_prefix}-lambda"
}

# Upload the placeholder code
resource "aws_s3_object" "lambda" {
  bucket = aws_s3_bucket.lambda.id
  key    = "${local.file}.zip"
  source = data.archive_file.lambda.output_path
  etag   = filemd5(data.archive_file.lambda.output_path)
}
