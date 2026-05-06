/**
 * @typedef {import('@/constants/taskStatus.js').TASK_STATUS} TASK_STATUS
 */

/**
 * Task Entity 속성 정의
 * @typedef {object} TaskData
 * @property {number} taskId                        - 작업 카드 고유 ID
 * @property {string} title                         - 작업 제목
 * @property {string | null} description            - 작업 상세 설명
 * @property {TASK_STATUS[keyof TASK_STATUS]} status - 작업 상태 (Enum 기반)
 * @property {string[] | null} tags                 - 태그 목록
 * @property {string | null} notes                  - 상세 메모 (마크다운)
 * @property {string | null} assigneeId             - 담당자 아이디 (username)
 * @property {string | null} assigneeName           - 담당자 이름 (nickname)
 * @property {string | null} assigneeProfileImage    - 담당자 프로필 이미지 URL
 * @property {string | null} startDate              - 시작일 (ISO 8601 문자열)
 * @property {string | null} dueDate                - 마감일 (ISO 8601 문자열)
 * @property {string} createdDate                   - 생성일 (ISO 8601 문자열)
 * @property {string} updatedDate                   - 최종 수정일 (ISO 8601 문자열)
 */

/**
 * 작업 카드 요청 DTO (클라이언트 요청 형식)
 * @see TaskRequestDTO.java
 * @see ../../../../../backend/src/main/java/backend/dto/taskcard/TaskRequestDTO.java
 * @typedef {object} TaskRequestDTO
 * @property {string} title
 * @property {string | null} description
 * @property {TASK_STATUS[keyof TASK_STATUS]} status
 * @property {string[] | null} tags
 * @property {string | null} notes
 * @property {string | null} assigneeId
 * @property {string | null} startDate
 * @property {string | null} dueDate
 */

/**
 * [목록 조회용] 작업 요약 정보 DTO
 * @typedef {object} TaskSummaryDTO
 * @property {number} taskId                        - 작업 카드 고유 ID
 * @property {string} title                         - 작업 카드 제목
 * @property {string} [description]                 - 작업 설명 (Optional)
 * @property {TASK_STATUS[keyof TASK_STATUS]} status - 작업 상태
 * @property {string[]} tags                        - 태그 목록
 * @property {string} [createdDate]                 - 생성일 (ISO 문자열)
 * @property {string} [updatedAt]                   - 수정일 (ISO 문자열)
 * @property {string} [dueDate]                     - 마감일 (ISO 문자열)
 * @property {string} [assigneeId]                  - 담당자 아이디
 * @property {string} [assigneeName]                - 담당자 이름
 */

export {};
