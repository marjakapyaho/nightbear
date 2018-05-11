resource "aws_iam_access_key" "this" {
  user = "${aws_iam_user.this.name}"
}

resource "aws_iam_user" "this" {
  name = "${var.metrics_cloudwatch_readonly_user}"
}

# Based on "arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess"
resource "aws_iam_user_policy" "this" {
  name = "${var.metrics_cloudwatch_readonly_user}"
  user = "${aws_iam_user.this.name}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "cloudwatch:Describe*",
        "cloudwatch:Get*",
        "cloudwatch:List*",
        "logs:Get*",
        "logs:List*",
        "logs:Describe*",
        "logs:TestMetricFilter"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}
