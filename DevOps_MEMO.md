## CI Front
브랜치명    : frontend
발동조건    : pull request
경로        : frontend/
사용환경    : node.js
버전        : 18
Secrets    :
    DISCORD     : 디스코드 웹훅

## CD Front
브랜치명    : main
발동조건    : merge
경로        : frontend/
Secrets    :
    SERVER_HOST     : NginX 서버 주소
    SERVER_SSH_KEY  : NginX 서버 pem키
nginx 인스턴스에 SSH 접속후 파일 전송

## CI Back
브랜치명    : backend
발동조건    : pull request
경로        : backend/
사용환경    : JDK (Gradle)
버전        : 17
Secrets    :
    DISCORD     : 디스코드 웹훅

## CD Back
브랜치명    : main
발동조건    : merge
경로        : backend/
Dockerfile  : /
Secrets    :
    AWS_ROLD_ARN        : ECR 업로드 권한
    AWS_REGION          : AWS 리전
    ECR_REPOSITORY_NAME : ECR 이름
Docker 빌드 후 ECR 업로드

## NginX
'/' 경로 요청       : 정적파일 제공
정적파일 경로       : /var/www/html
'/api' 경로 요청    : main server로 프록시 

## Dockerfile
JDK Version : 17