variable "region" {
  description = "The AWS region to create resources in"
  type        = string
  default     = "ap-northeast-2"
}

data "aws_ami" "ami" {
  most_recent = true
  filter {
    name = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server*"]
  }

  filter {
    name = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"]
}

resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "keypair" {
  key_name   = "generated-key-${terraform.workspace}"
  public_key = tls_private_key.ssh_key.public_key_openssh
}

# # 생성된 프라이빗 키를 로컬 파일로 저장
# resource "local_file" "private_key" {
#   content         = tls_private_key.ssh_key.private_key_pem
#   filename        = "${path.module}/ssh_keys/${terraform.workspace}_private_key.pem"
#   file_permission = "0600"
# }