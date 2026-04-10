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