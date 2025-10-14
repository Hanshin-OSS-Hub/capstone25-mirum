resource "aws_instance" "app_server_1" {
  ami = data.aws_ami.ami.id
  associate_public_ip_address = false
  instance_type = "t2.micro"
  subnet_id = aws_subnet.app_server_1.id
  key_name = aws_key_pair.keypair.key_name
  vpc_security_group_ids = [aws_security_group.for_ec2.id]

  iam_instance_profile = aws_iam_instance_profile.ec2_instance_profile.name

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io
              systemctl start docker
              systemctl enable docker
              EOF

  root_block_device {
    volume_size = 10
  }
}

# resource "aws_instance" "app_server_2" {
#   ami = data.aws_ami.ami.id
#   associate_public_ip_address = false
#   instance_type = "t2.micro"
#   subnet_id = aws_subnet.app_server_2.id
#   key_name = aws_key_pair.keypair.key_name
#   vpc_security_group_ids = [aws_security_group.for_ec2.id]

#   iam_instance_profile = aws_iam_instance_profile.ec2_instance_profile.name

#   root_block_device {
#     volume_size = 10
#   }
# }