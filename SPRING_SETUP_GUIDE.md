# Spring Boot 애플리케이션 설정 가이드

## 1. RDS 연결 설정 (Secrets Manager 자동 통합)

### ✨ 방법 1: Spring Cloud AWS 사용 (가장 쉬움, 권장!)

**Spring Cloud AWS**는 AWS Secrets Manager와 자동으로 통합되어, **별도 코드 없이 설정만으로** DB 비밀번호를 가져옵니다.

---

#### 📦 Step 1: 의존성 추가

**build.gradle (Gradle)**:
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'com.mysql:mysql-connector-j'
    
    // 🔑 Spring Cloud AWS - Secrets Manager 자동 통합
    implementation 'io.awspring.cloud:spring-cloud-aws-starter-secrets-manager:3.0.3'
}
```

---

#### ⚙️ Step 2: application.yml 설정

```yaml
spring:
  application:
    name: my-app
    
  # 🔑 Spring Cloud AWS 설정
  cloud:
    aws:
      region:
        static: ap-northeast-2
      credentials:
        instance-profile: true  # EC2 IAM Role 사용 (자동 인증)
      secrets-manager:
        enabled: true
        name: db_password  # ← Terraform에서 생성한 시크릿 이름
        
  # 데이터베이스 연결 설정
  datasource:
    url: jdbc:mysql://${DB_ENDPOINT}/mydatabase?useSSL=true&serverTimezone=Asia/Seoul
    username: admin
    password: ${db_password}  # ← Spring Cloud AWS가 자동으로 주입!
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
    show-sql: true
```

---

### 📊 **실제 로그 예시**

애플리케이션 시작 시 콘솔 출력:

```log
2025-01-16 10:30:14.123  INFO 1 --- [main] c.example.MyApplication : Starting MyApplication

2025-01-16 10:30:15.123  INFO 1 --- [main] i.a.c.s.AwsSecretsManagerPropertySource : 
  Loading secrets from AWS Secrets Manager: db_password

2025-01-16 10:30:15.456  INFO 1 --- [main] i.a.c.s.AwsSecretsManagerPropertySource : 
  Successfully loaded secret: db_password (16 characters)

2025-01-16 10:30:15.789  INFO 1 --- [main] com.zaxxer.hikari.HikariDataSource : 
  HikariPool-1 - Starting...

2025-01-16 10:30:16.123  INFO 1 --- [main] com.zaxxer.hikari.HikariDataSource : 
  HikariPool-1 - Start completed.

2025-01-16 10:30:16.456  INFO 1 --- [main] o.h.jpa.internal.util.LogHelper : 
  HHH000204: Processing PersistenceUnitInfo [name: default]

2025-01-16 10:30:17.123  INFO 1 --- [main] c.example.MyApplication : 
  Started MyApplication in 3.456 seconds (JVM running for 4.123)
```

---

## 2. S3 연결 설정

### 📦 의존성 추가

**build.gradle (Gradle)**:
```gradle
implementation 'software.amazon.awssdk:s3:2.20.0'
```

### ⚙️ S3Config.java

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {
    
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.AP_NORTHEAST_2)
                .build(); // EC2 IAM Role 자동 인식 (액세스 키 불필요!)
    }
}
```

### 📤 S3Service.java

```java
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import java.io.InputStream;

@Service
public class S3Service {
    
    private final S3Client s3Client;
    private static final String BUCKET_NAME = "my-user-data-bucket-123456";
    
    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }
    
    /**
     * 파일 업로드
     */
    public String uploadFile(String key, InputStream inputStream, long contentLength) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(key)
                .build();
        
        s3Client.putObject(request, 
                RequestBody.fromInputStream(inputStream, contentLength));
        
        return String.format("https://%s.s3.ap-northeast-2.amazonaws.com/%s", 
                BUCKET_NAME, key);
    }
    
    /**
     * 파일 다운로드
     */
    public InputStream downloadFile(String key) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(key)
                .build();
        
        return s3Client.getObject(request);
    }
    
    /**
     * 파일 삭제
     */
    public void deleteFile(String key) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(key)
                .build();
        
        s3Client.deleteObject(request);
    }
    
    /**
     * 파일 목록 조회
     */
    public List<String> listFiles() {
        ListObjectsV2Request request = ListObjectsV2Request.builder()
                .bucket(BUCKET_NAME)
                .build();
        
        ListObjectsV2Response response = s3Client.listObjectsV2(request);
        
        return response.contents().stream()
                .map(S3Object::key)
                .collect(Collectors.toList());
    }
}
```

### 🌐 FileController.java (예시)

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/files")
public class FileController {
    
    private final S3Service s3Service;
    
    public FileController(S3Service s3Service) {
        this.s3Service = s3Service;
    }
    
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String key = "uploads/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String url = s3Service.uploadFile(key, 
                    file.getInputStream(), 
                    file.getSize());
            return ResponseEntity.ok(url);
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body("Upload failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/list")
    public ResponseEntity<List<String>> listFiles() {
        return ResponseEntity.ok(s3Service.listFiles());
    }
    
    @DeleteMapping("/{fileName}")
    public ResponseEntity<String> deleteFile(@PathVariable String fileName) {
        s3Service.deleteFile("uploads/" + fileName);
        return ResponseEntity.ok("Deleted: " + fileName);
    }
}
```

---

## 3. Docker 이미지 빌드 & 자동 배포

### 📦 Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app

# JAR 파일 복사
COPY target/*.jar app.jar

# 8080 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 🚀 GitHub Actions 워크플로우

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write    # OIDC 인증용
      contents: read
      
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'maven'
          
      - name: Build with Maven
        run: mvn clean package -DskipTests
        
      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-northeast-2
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
        
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: my-docker-repo
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                     $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
```

## 4. 전체 배포 플로우

```
┌─────────────────┐
│  코드 Push      │
│  (GitHub)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│ - Build Spring  │
│ - Build Docker  │
│ - Push to ECR   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ECR Push       │
│  이벤트 발생    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  EventBridge    │
│  자동 감지      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lambda 실행    │
│  image_pull     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SSM 명령 전송  │
│  to EC2         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  EC2에서 Docker 명령 실행   │
│  1. docker pull <새이미지>  │
│  2. docker stop 기존컨테이너│
│  3. docker rm 기존컨테이너  │
│  4. docker run 새컨테이너   │
│     -e DB_ENDPOINT=...      │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Spring Boot 시작           │
│  1. Spring Cloud AWS 실행   │
│  2. Secrets Manager 조회    │
│  3. DB 연결                 │
│  4. 애플리케이션 준비 완료  │
└─────────────────────────────┘
```
---

## 5. 환경변수 정리

### Terraform Output으로 확인 가능한 정보

```bash
terraform output rds_endpoint           # RDS 주소
terraform output rds_username           # admin
terraform output rds_database_name      # mydatabase
terraform output s3_bucket_name         # my-user-data-bucket-123456
terraform output ecr_repository_name    # my-docker-repo
terraform output nginx_eip              # Nginx 공용 IP
```