output "nginx_eip" {
  description = "Nginx Public IP Address"
  value       = aws_eip.for_nginx.public_ip
}

output "ecr_repository_name" {
  description = "ECR Repository Name for GitHub Actions"
  value       = aws_ecr_repository.docker.name
}

output "github_actions_role_arn" {
  description = "ARN of the IAM Role for GitHub Actions"
  value       = aws_iam_role.github_actions_role.arn
}

output "aws_region" {
  description = "The AWS region for Github Actions"
  value       = var.region
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = aws_db_instance.my_db.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.my_db.db_name
}

output "rds_username" {
  description = "RDS username"
  value       = aws_db_instance.my_db.username
}

output "s3_bucket_name" {
  description = "S3 bucket name for user data"
  value       = aws_s3_bucket.user_data.bucket
}

