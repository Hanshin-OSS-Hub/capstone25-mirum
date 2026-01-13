import boto3
import os
import json

def lambda_handler(event, context):
    ssm_client = boto3.client('ssm')
    
    # Terraform 환경 변수에서 인스턴스 ID 목록을 가져옵니다.
    instance_ids = os.environ['INSTANCE_IDS'].split(',')
    
    # GitHub Actions에서 전달받은 Docker 이미지 URI
    image_uri = event['image_uri']
    
    # Secrets Manager에서 DB 정보 가져오기
    try:
        db_endpoint = os.environ.get('DB_ENDPOINT', '')
    except Exception as e:
        print(f"Error fetching secrets: {e}")
        db_endpoint = ''

    # EC2에서 실행할 쉘 스크립트
    commands = [
        'echo "--- Starting deployment for image: {} ---"'.format(image_uri),
        'sudo docker pull {}'.format(image_uri),
        'sudo docker stop my-app-container || true',
        'sudo docker rm my-app-container || true',
        'sudo docker run -d --name my-app-container -p 8080:8080 -e DB_ENDPOINT="{}" {}'.format(db_endpoint, image_uri),
        'echo "--- Deployment finished ---"'
    ]
    
    try:
        response = ssm_client.send_command(
            InstanceIds=instance_ids,
            DocumentName='AWS-RunShellScript',
            Parameters={'commands': commands}
        )
        command_id = response['Command']['CommandId']
        print(f"SSM Command sent successfully. Command ID: {command_id}")
        
        return {
            'statusCode': 200,
            'body': json.dumps(f"Command sent to instances {instance_ids}. Command ID: {command_id}")
        }
    except Exception as e:
        print(f"Error sending SSM command: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error: {str(e)}")
        }