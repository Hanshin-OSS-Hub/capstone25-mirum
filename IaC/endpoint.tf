/*
# S3 Endpoint
# ECR은 내부적으로 S3를 사용하므로 S3 Endpoint를 생성해야 ECR과 통신 가능
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.for_private.id]
}

# ECR Endpoint
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.ecr.api"
  vpc_endpoint_type = "Interface"
  
  # AWS가 자동으로 가로채서 엔드포인트에 연결해 줌
  private_dns_enabled = true

  subnet_ids        = [aws_subnet.app_server_1.id] #, aws_subnet.app_server_2.id]
  security_group_ids = [aws_security_group.for_endpoint.id]
}

# ECR DKR Endpoint
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.ecr.dkr"
  vpc_endpoint_type = "Interface"
  private_dns_enabled = true
  subnet_ids        = [aws_subnet.app_server_1.id] #, aws_subnet.app_server_2.id]
  security_group_ids = [aws_security_group.for_endpoint.id]
}

# SSM Endpoint
resource "aws_vpc_endpoint" "ssm" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.ssm"
  vpc_endpoint_type = "Interface"
  private_dns_enabled = true
  subnet_ids        = [aws_subnet.app_server_1.id] #, aws_subnet.private_subnet_2.id]
  security_group_ids = [aws_security_group.for_endpoint.id]
}

# SSM Messages Endpoint
resource "aws_vpc_endpoint" "ssm_messages" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.ssmmessages"
  vpc_endpoint_type = "Interface"
  private_dns_enabled = true
  subnet_ids        = [aws_subnet.app_server_1.id] #, aws_subnet.private_subnet_2.id]
  security_group_ids = [aws_security_group.for_endpoint.id]
}

# EC2 Messages Endpoint
resource "aws_vpc_endpoint" "ec2_messages" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.ec2messages"
  vpc_endpoint_type = "Interface"
  private_dns_enabled = true
  subnet_ids        = [aws_subnet.app_server_1.id] #, aws_subnet.private_subnet_2.id]
  security_group_ids = [aws_security_group.for_endpoint.id]
} 

# Secrets Manager Endpoint
resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.secretsmanager"
  vpc_endpoint_type = "Interface"
  
  private_dns_enabled = true
  subnet_ids = [aws_subnet.app_server_1.id] #, aws_subnet.app_server_2.id]
  
  security_group_ids = [aws_security_group.for_endpoint.id]
}

*/