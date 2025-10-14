# 파이썬 코드를 zip으로 압축
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/image_pull.py"
  output_path = "${path.module}/image_pull.zip"
}

# Lambda 함수 생성
resource "aws_lambda_function" "image_pull" {
  function_name = "image_pull"
  role         = aws_iam_role.lambda_iam_role.arn
  handler     = "image_pull.lambda_handler"
  runtime     = "python3.9"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  filename    = data.archive_file.lambda_zip.output_path
  environment {
    variables = {
      INSTANCE_IDS = join(",", [aws_instance.app_server_1.id]) #, aws_instance.app_server_2.id])
    }
  }
}
