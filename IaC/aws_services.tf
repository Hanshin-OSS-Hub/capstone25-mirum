resource "aws_ecr_repository" "docker" {
    name = "my-docker-repo"
    
    # 이미지가 덮어쓰여도 스캔하도록 함
    image_scanning_configuration {
      scan_on_push = true
    }

    tags = {
        Name = "my-docker-repo"
    }
}

resource "aws_s3_bucket" "user_data" {
    bucket = "my-user-data-bucket-123456"

    tags = {
        Name = "my-user-data-bucket"
    }
}

resource "aws_s3_bucket_cors_configuration" "user_data_cors" {
    bucket = aws_s3_bucket.user_data.id

    cors_rule {
        allowed_headers = ["*"]
        allowed_methods = ["PUT", "GET", "POST"]
        allowed_origins = ["http://${aws_eip.for_nginx.public_ip}", "http://localhost:5173"]
        expose_headers = ["ETag"]
        max_age_seconds = 3000
    }
}
