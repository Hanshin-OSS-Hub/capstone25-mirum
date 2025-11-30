####################### VPC #######################
provider "aws" {
  region = "ap-northeast-2"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
  tags = {
    Name = "main_vpc"
  }
}
###################################################

################### NAT Gateway ###################
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id = aws_subnet.public_subnet_1.id
  depends_on = [aws_internet_gateway.igw]  
}

resource "aws_route" "nat_gateway_route" {
  route_table_id = aws_route_table.for_private.id
  destination_cidr_block = "0.0.0.0/0"  
  nat_gateway_id = aws_nat_gateway.main.id
}

resource "aws_eip" "nat" {
  domain = "vpc"
  lifecycle {
    create_before_destroy = true
  }
}
###################################################

####################### AZ - a ####################
resource "aws_subnet" "public_subnet_1" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "ap-northeast-2a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "app_server_1" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "ap-northeast-2a"
}

resource "aws_subnet" "database_subnet" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.3.0/24"
  availability_zone = "ap-northeast-2a"
}

resource "aws_subnet" "database_subnet_2" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.6.0/24"
  availability_zone = "ap-northeast-2c"
}
###################################################

# resource "aws_subnet" "public_subnet_2" {
#   vpc_id = aws_vpc.main.id
#   cidr_block = "10.0.4.0/24"
#   availability_zone = "ap-northeast-2b"
# }

# resource "aws_subnet" "app_server_2" {
#   vpc_id = aws_vpc.main.id
#   cidr_block = "10.0.5.0/24"
#   availability_zone = "ap-northeast-2b"
# }



# 로드밸런서 설정 (비용 절감을 위해 주석 처리)

# resource "aws_lb" "LB" {
#   name = "myLB"
#   internal = false
#   load_balancer_type = "application"
#   security_groups = [aws_security_group.for_lb.id]
#   subnets = [aws_subnet.public_subnet_1.id] #, aws_subnet.public_subnet_2.id]
# }

# resource "aws_lb_target_group" "tg" {
#   name = "TargetGroup"
#   port = 80
#   protocol = "HTTP"
#   vpc_id = aws_vpc.main.id
#   health_check {
#     path = "/health"
#     port = "80"
#     protocol = "HTTP"
#     interval = 30
#     timeout = 5
#     healthy_threshold = 2
#     unhealthy_threshold = 2
#   }
# }

# resource "aws_lb_target_group_attachment" "web_server_1_attach" {
#   target_group_arn = aws_lb_target_group.tg.arn
#   target_id        = aws_instance.nginx_1.id
#   port             = 80
# }

# resource "aws_lb_target_group_attachment" "web_server_2_attach" {
#   target_group_arn = aws_lb_target_group.tg.arn
#   target_id        = aws_instance.nginx_2.id
#   port             = 80
# }

# resource "aws_lb_listener" "lb_listener" {
#   load_balancer_arn = aws_lb.LB.arn
#   port = 80
#   protocol = "HTTP"
#   default_action {
#     type = "forward"
#     target_group_arn = aws_lb_target_group.tg.arn
#   }
# }

# 인터넷 게이트웨이
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}
