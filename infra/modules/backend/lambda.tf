# IAM role that allows Lambda to access resources in our AWS account
resource "aws_iam_role" "this" {
  name = "${var.name_prefix}-lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# AWS managed policy which provides write permissions to CloudWatch Logs
resource "aws_iam_role_policy_attachment" "lambda_exec" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Creates our actual function
resource "aws_lambda_function" "this" {
  function_name = var.name_prefix
  s3_bucket     = aws_s3_bucket.this.id
  s3_key        = aws_s3_object.this.key
  runtime       = "nodejs20.x"
  handler       = "${local.file}.${local.handler}"
  role          = aws_iam_role.this.arn

  # Note: because we're deploying outside of Terraform, we're not adding the usual update trigger:
  # source_code_hash = data.archive_file.this.output_base64sha256

  logging_config {
    log_format = "JSON" # enable JSON logging (see https://docs.aws.amazon.com/lambda/latest/dg/nodejs-logging.html for format examples)
  }

  environment {
    variables = {
      NODE_PATH             = "."                      # so that node can resolve module paths like "shared/utils/logging" during runtime
      DATABASE_URL          = var.secrets.database_url # where can we reach our DB
      DEBUG                 = "nightbear*"             # turn on logging for the "nightbear" namespace (see https://www.npmjs.com/package/debug)
      NIGHTBEAR_DB_URL      = "TODO: Remove once not expected by createNodeContext()"
      PUSHOVER_USER         = "TODO: Add correct value once we re-enable the integration"
      PUSHOVER_TOKEN        = "TODO: Add correct value once we re-enable the integration"
      PUSHOVER_CALLBACK     = "TODO: Add correct value once we re-enable the integration"
      DEXCOM_SHARE_USERNAME = var.secrets.dexcom_share_username
      DEXCOM_SHARE_PASSWORD = var.secrets.dexcom_share_password
    }
  }
}

# Adjust log retention (the group will be created regardless)
resource "aws_cloudwatch_log_group" "function" {
  name              = "/aws/lambda/${aws_lambda_function.this.function_name}"
  retention_in_days = 7
}
