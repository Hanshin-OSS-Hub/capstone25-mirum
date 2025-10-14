# Route Table for Public Subnets
resource "aws_route_table" "for_public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

# Route Table Associations For Public Subnets
resource "aws_route_table_association" "public_1" {
  subnet_id = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.for_public.id
}

# resource "aws_route_table_association" "public_2" {
#   subnet_id = aws_subnet.public_subnet_2.id
#   route_table_id = aws_route_table.for_public.id
# }

# Route Table for Private Subnets
resource "aws_route_table" "for_private" {
  vpc_id = aws_vpc.main.id
}

# Route Table Associations For Private Subnets
resource "aws_route_table_association" "private_1" {
  subnet_id = aws_subnet.app_server_1.id
  route_table_id = aws_route_table.for_private.id
}

# resource "aws_route_table_association" "private_2" {
#   subnet_id = aws_subnet.app_server_2.id
#   route_table_id = aws_route_table.for_private.id
# }
