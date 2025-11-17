resource "aws_db_subnet_group" "db_subnet" {
  name       = "db-subnet-group"
  subnet_ids = [aws_subnet.database_subnet.id, aws_subnet.database_subnet_2.id]

  tags = {
    Name = "db-subnet-group"
  }
}

resource "aws_db_parameter_group" "db_pg" {
  family = "mysql8.0"
  name   = "my-db-parameter-group"
  description = "My DB Parameter Group"

  parameter {
    name  = "time_zone"
    value = "Asia/Seoul"
  }
  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }
  parameter {
    name = "collation_server"
    value = "utf8mb4_general_ci"
  }
}

resource "aws_secretsmanager_secret" "db_password" {
  name = "db_password"
}

resource "random_password" "name"{
  length = 16
  special = true
  override_special = "!#$%&*()+-=[]{}|?"
}

resource "aws_secretsmanager_secret_version" "name" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.name.result
}


resource "aws_db_instance" "my_db" {
  multi_az = false
  identifier = "my-db"
  allocated_storage = 20
  engine = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"
  db_name = "mydatabase"
  username = "admin"
  password = aws_secretsmanager_secret_version.name.secret_string
  parameter_group_name = aws_db_parameter_group.db_pg.name
  db_subnet_group_name = aws_db_subnet_group.db_subnet.name
  vpc_security_group_ids = [aws_security_group.for_database.id]
  skip_final_snapshot = true
  publicly_accessible = false
}