# IAM role that allows Lambda to access resources in our AWS account
resource "aws_iam_role" "lambda" {
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
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# We'll be using the default VPC for this
data "aws_vpc" "default" {
  default = true
}

# No need for custom rules → use the default security group for the default VPC
data "aws_security_group" "default" {
  vpc_id = data.aws_vpc.default.id
  name   = "default"
}

# Provides minimum permissions for a Lambda function to execute while accessing a resource within a VPC
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Creates our actual function
resource "aws_lambda_function" "lambda" {
  function_name    = var.name_prefix
  s3_bucket        = aws_s3_bucket.lambda.id
  s3_key           = aws_s3_object.lambda.key
  runtime          = "nodejs20.x"
  handler          = "${local.file}.handler"
  source_code_hash = data.archive_file.lambda.output_base64sha256
  role             = aws_iam_role.lambda.arn

  vpc_config {
    security_group_ids = [data.aws_security_group.default.id]
    subnet_ids         = var.subnet_ids
  }
}

# Create a group for logs
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.lambda.function_name}"
  retention_in_days = 7
}
