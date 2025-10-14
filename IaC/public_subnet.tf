resource "aws_instance" "nginx_1" {
  ami = data.aws_ami.ami.id
  associate_public_ip_address = false
  instance_type = "t2.micro"
  subnet_id = aws_subnet.public_subnet_1.id
  key_name = aws_key_pair.keypair.key_name
  vpc_security_group_ids = [aws_security_group.for_nginx.id]
  
  user_data = templatefile("${path.module}/nginx.conf.tftpl", {
    app_server_ip = aws_instance.app_server_1.private_ip
  })

  root_block_device {
    volume_size = 10
  }
}

# resource "aws_instance" "nginx_2" {
#   ami = data.aws_ami.ami.id
#   associate_public_ip_address = false
#   instance_type = "t2.micro"
#   subnet_id = aws_subnet.public_subnet_2.id
#   key_name = aws_key_pair.keypair.key_name
#   vpc_security_group_ids = [aws_security_group.for_nginx.id]
  
#   user_data = <<-EOF
#               #!/bin/bash
#               apt-get update
#               apt-get install -y nginx
#               systemctl start nginx
#               systemctl enable nginx
#               EOF

#   root_block_device {
#     volume_size = 10
#   }
# }