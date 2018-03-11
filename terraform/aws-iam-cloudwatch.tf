resource "aws_iam_access_key" "cloudwatch_readonly_user" {
  user = "${aws_iam_user.cloudwatch_readonly_user.name}"
}

resource "aws_iam_user" "cloudwatch_readonly_user" {
  name = "cloudwatch_readonly_user"
}

# Based on "arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess"
resource "aws_iam_user_policy" "cloudwatch_readonly_user" {
  name   = "cloudwatch_readonly_user"
  user   = "${aws_iam_user.cloudwatch_readonly_user.name}"
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

output "cloudwatch_readonly_user_aws_secret_key" {
  value = "${aws_iam_access_key.cloudwatch_readonly_user.secret}"
}

output "cloudwatch_readonly_user_aws_access_key" {
  value = "${aws_iam_access_key.cloudwatch_readonly_user.id}"
}
