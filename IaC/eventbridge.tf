# ECR 이미지 푸시 이벤트를 감지하는 EventBridge Rule
resource "aws_cloudwatch_event_rule" "ecr_image_push" {
  name        = "ecr-image-push-rule"
  description = "Trigger Lambda when new image is pushed to ECR"

  event_pattern = jsonencode({
    source      = ["aws.ecr"]
    detail-type = ["ECR Image Action"]
    detail = {
      action-type = ["PUSH"]
      result      = ["SUCCESS"]
      repository-name = [aws_ecr_repository.docker.name]
      image-tag = [
        { "anything-but": "latest" }
      ]
    }
  })
}

# EventBridge Rule이 Lambda를 트리거하도록 설정
resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.ecr_image_push.name
  target_id = "lambda-image-pull"
  arn       = aws_lambda_function.image_pull.arn

  # Lambda에 전달할 입력 데이터 (이미지 URI)
  input_transformer {
    input_paths = {
      repository = "$.detail.repository-name"
      tag        = "$.detail.image-tag"
      account    = "$.account"
    }
    input_template = <<EOF
{
  "image_uri": "<account>.dkr.ecr.ap-northeast-2.amazonaws.com/<repository>:<tag>"
}
EOF
  }
}

# Lambda가 EventBridge에 의해 호출될 수 있도록 권한 부여
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_pull.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ecr_image_push.arn
}
