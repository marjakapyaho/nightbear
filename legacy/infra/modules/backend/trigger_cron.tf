# Create a trigger that generates an event every N minutes
resource "aws_cloudwatch_event_rule" "this" {
  name                = "${var.name_prefix}-cron"
  schedule_expression = "rate(1 minute)"
}

# Plug the trigger/event to our function
resource "aws_cloudwatch_event_target" "this" {
  rule = aws_cloudwatch_event_rule.this.name
  arn  = aws_lambda_function.this.arn
}

# Allow CloudWatch to trigger our Lambda
resource "aws_lambda_permission" "cron" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.this.arn
}
