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
              VERSION=0.7.1
              curl -o /usr/local/bin/docker-credential-ecr-login "https://amazon-ecr-credential-helper-releases.s3.us-east-2.amazonaws.com/${VERSION}/linux-amd64/docker-credential-ecr-login"
              chmod +x /usr/local/bin/docker-credential-ecr-login
              mkdir -p /root/.docker
              echo '{
                  "credsStore": "ecr-login"
              }' > /root/.docker/config.json
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