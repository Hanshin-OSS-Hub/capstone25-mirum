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
    description = "IAM policy for Lambda to access SSM, Secrets Manager, and CloudWatch Logs"
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
                    "arn:aws:ssm:${var.region}::document/AWS-RunShellScript"
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

# Attach IAM Lambda Policy to Role
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

# EC2 S3 IAM Policy
resource "aws_iam_policy" "ec2_s3_policy" {
  name        = "ec2_s3_policy"
  description = "IAM policy for EC2 to access S3"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.user_data.arn,
          "${aws_s3_bucket.user_data.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_s3_policy_attachment" {
  role       = aws_iam_role.ec2_iam_role.name
  policy_arn = aws_iam_policy.ec2_s3_policy.arn
}

# EC2 Secrets Manager IAM Policy
resource "aws_iam_policy" "ec2_secrets_policy" {
  name        = "ec2_secrets_policy"
  description = "IAM policy for EC2 to access Secrets Manager"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:${var.region}:${data.aws_caller_identity.current.account_id}:secret:db_password-*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_secrets_policy_attachment" {
  role       = aws_iam_role.ec2_iam_role.name
  policy_arn = aws_iam_policy.ec2_secrets_policy.arn
}

# EC2 Instance Profile
resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "ec2_instance_profile"
  role = aws_iam_role.ec2_iam_role.name
}

# IAM OIDC for GitHub Actions 한번만 생성하고 삭제할 것
data "tls_certificate" "github_actions" {
  url = "https://token.actions.githubusercontent.com/.well-known/jwks"
}

resource "aws_iam_openid_connect_provider" "github_actions_oidc" {
  url                  = "https://token.actions.githubusercontent.com"
  client_id_list       = ["sts.amazonaws.com"]
  thumbprint_list      = [data.tls_certificate.github_actions.certificates[0].sha1_fingerprint]
}

# IAM Role for GitHub Actions
resource "aws_iam_role" "github_actions_role" {
  name = "github_actions_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = "sts:AssumeRoleWithWebIdentity",
        Principal = {
          Federated = aws_iam_openid_connect_provider.github_actions_oidc.arn
        },
        Condition = {
          StringLike = {
            "token.actions.githubusercontent.com:sub": "repo:Hanshin-OSS-Hub/capstone25-mirum:ref:refs/heads/main"
          },
          "ForAllValues:StringEquals" = {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

# AWS 관리형 정책 사용 (ECR Power User)
resource "aws_iam_role_policy_attachment" "github_actions_ecr_power_user" {
  role       = aws_iam_role.github_actions_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}