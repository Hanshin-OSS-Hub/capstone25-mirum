# AWS 계정 정보 가져오기
data "aws_caller_identity" "current" {}

# Lambda IAM Role
resource "aws_iam_role" "lambda_iam_role" {
  name = "lambda_iam_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

# Lambda IAM Policy
resource "aws_iam_policy" "lambda_iam_policy" {
    name        = "lambda_iam_policy"
    description = "IAM policy for Lambda to access ECR"
    policy      = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = [
                    "ssm:sendCommand",
                ]
                Effect = "Allow"
                Resource = [
                    "arn:aws:ec2:${var.region}:${data.aws_caller_identity.current.account_id}:instance/*",
                    "arn:aws:ssm:${var.region}:${data.aws_caller_identity.current.account_id}:document/AWS-RunShellScript"
                ]
            },
            {
                Action = [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ]
                Effect = "Allow"
                Resource = "arn:aws:logs:*:*:*"
            }
        ]
    })
}

# Attach IAM Policy to Role
resource "aws_iam_role_policy_attachment" "lambda_iam_role_policy_attachment" {
    policy_arn = aws_iam_policy.lambda_iam_policy.arn
    role       = aws_iam_role.lambda_iam_role.name
}

# EC2 IAM Role
resource "aws_iam_role" "ec2_iam_role" {
  name = "ec2_iam_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

# EC2 SSM IAM Policy Attachment
resource "aws_iam_role_policy_attachment" "ec2_iam_role_policy_attachment" {
  role       = aws_iam_role.ec2_iam_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# EC2 ECR IAM Policy Attachment
resource "aws_iam_role_policy_attachment" "ec2_ecr_iam_role_policy_attachment" {
  role       = aws_iam_role.ec2_iam_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# EC2 Instance Profile
resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "ec2_instance_profile"
  role = aws_iam_role.ec2_iam_role.name
}
