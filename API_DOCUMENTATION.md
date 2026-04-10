# 📘 Project API 명세서

## 1. 공통 응답 포맷
모든 API 응답은 아래와 같은 JSON 구조를 가집니다.
```json
{
  "success": true, // 성공 여부 (true/false)
  "message": "성공", // 응답 메시지
  "data": { ... }  // 실제 데이터 (없을 경우 null)
}
```

---

## 2. 프로젝트 관리 (Project)

### 2.1 프로젝트 생성
*   **URL:** `POST /project`
*   **설명:** 새로운 프로젝트를 생성합니다.
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **요청 바디 (JSON):**
    ```json
    {
      "projectName": "새 프로젝트",
      "description": "프로젝트 설명입니다."
    }
    ```
    *(참고: `projectId` 필드는 생성 시 무시됩니다)*
*   **응답 데이터:**
    ```json
    {
      "projectId": 1
    }
    ```

### 2.2 프로젝트 상세 조회
*   **URL:** `GET /project/{projectId}`
*   **설명:** 특정 프로젝트의 상세 정보와 멤버 목록을 조회합니다.
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **응답 데이터:**
    ```json
    {
      "projectName": "새 프로젝트",
      "description": "프로젝트 설명입니다.",
      "creationDate": "2024-01-01T12:00:00",
      "members": [
        {
          "username": "user1",
          "role": "LEADER" // LEADER 또는 MEMBER
        },
        {
          "username": "user2",
          "role": "MEMBER"
        }
      ]
    }
    ```

### 2.3 프로젝트 정보 수정
*   **URL:** `PUT /project`
*   **설명:** 프로젝트 이름이나 설명을 수정합니다. (리더 권한 필요)
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **요청 바디 (JSON):**
    ```json
    {
      "projectId": 1,
      "projectName": "수정된 프로젝트 이름",
      "description": "수정된 설명"
    }
    ```
*   **응답 데이터:** `null`

### 2.4 프로젝트 삭제
*   **URL:** `DELETE /project/{projectId}`
*   **설명:** 프로젝트를 삭제합니다. (리더 권한 필요)
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **응답 데이터:** `null`

---

## 3. 프로젝트 초대 (Invitation)
**Base URL:** `/invitations`

### 3.1 멤버 초대 발송
*   **URL:** `POST /invitations/`
*   **설명:** 다른 사용자를 프로젝트에 초대합니다.
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **요청 바디 (JSON):**
    ```json
    {
      "projectId": 1,
      "invitedName": "invite_target_user" // 초대할 유저의 username
    }
    ```
*   **응답 데이터:**
    ```json
    {
      "invitationNumber": 15
    }
    ```

### 3.2 초대 수락
*   **URL:** `POST /invitations/{inviteId}/accept`
*   **설명:** 받은 초대를 수락하여 프로젝트 멤버로 합류합니다.
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **응답 데이터:** `null`

### 3.3 초대 거절
*   **URL:** `PUT /invitations/{inviteId}/decline`
*   **설명:** 받은 초대를 거절합니다.
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **응답 데이터:** `null`

### 3.4 받은 초대 목록 조회
*   **URL:** `GET /invitations/received`
*   **설명:** 나에게 온 초대 목록을 확인합니다.
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **응답 데이터:**
    ```json
    [
      {
        "projectName": "프로젝트 A",
        "inviterName": "inviter_user", // 초대한 사람
        "inviteeName": "me",           // 나
        "status": "INVITED"            // INVITED, ACCEPTED, DECLINED
      }
    ]
    ```

### 3.5 보낸 초대 목록 조회
*   **URL:** `GET /invitations/sent`
*   **설명:** 내가 보낸 초대 목록을 확인합니다.
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **응답 데이터:** (위와 동일한 구조)

---

## 4. 프로젝트 멤버 관리 (Member)
**Base URL:** `/member`

### 4.1 멤버 목록 조회
*   **URL:** `GET /member/{projectId}`
*   **설명:** 프로젝트에 소속된 멤버 리스트를 조회합니다.
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **응답 데이터:**
    ```json
    [
      {
        "username": "user1",
        "role": "LEADER"
      },
      {
        "username": "user2",
        "role": "MEMBER"
      }
    ]
    ```

### 4.2 멤버 권한 수정
*   **URL:** `PUT /member/{projectId}/role`
*   **설명:** 멤버의 권한을 변경합니다. (리더 권한 필요)
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **요청 바디 (JSON):**
    ```json
    {
      "username": "target_user",
      "role": "LEADER" // 또는 "MEMBER"
    }
    ```
*   **응답 데이터:** `null`

### 4.3 멤버 퇴출 및 탈퇴
*   **URL:** `DELETE /member/{projectId}`
*   **설명:** 멤버를 내보내거나(리더), 스스로 탈퇴합니다.
*   **요청 헤더:** `Authorization: Bearer {token}`
*   **요청 바디 (Raw String):**
    *   주의: JSON 객체가 아니라 `username` 문자열 자체를 보냅니다.
    ```text
    target_user_name
    ```
    *(프론트엔드 구현 시 `Content-Type: text/plain` 또는 JSON 문자열 처리에 유의 필요)*
*   **응답 데이터:** `null`
