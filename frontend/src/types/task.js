/**
 * Task Entity 속성 정의
 * @typedef {Object} TaskData
 * @property {number} taskId
 * @property {string} title
 * @property {string | null} description
 * @property {'TODO' | 'IN_PROGRESS' | 'DONE' | 'DELETED'} status
 * @property {string[] | null} tags
 * @property {string | null} notes
 * @property {number} assigneeId                    // memberId는 없는데 그럼 username?
 * @property {string} assigneeName                  // nickname?
 * @property {string | null} assigneeProfileImage   // 현재 유저 엔티티에 없음
 * @property {Date | null} startDate                // 필요한데 없음
 * @property {Date | null} dueDate
 * @property {Date} createdDate
 * @property {Date} updatedDate
 */

/**
 * 작업 카드 요청 DTO (클라이언트 요청 형식)
 * @see TaskRequestDTO.java
 * @see ../../../../../backend/src/main/java/backend/dto/taskcard/TaskRequestDTO.java
 * @typedef {Pick<TaskData, 'title' | 'description' | 'status' | 'tags' | 'notes' | 'assigneeId' | 'startDate' | 'dueDate'>} TaskRequestDTO
 */

/**
 * [목록 조회용] 작업 요약 정보 DTO
 * @typedef {Object} TaskSummaryDTO
 * @property {TaskData['taskId']} taskId - 작업 카드 고유 ID
 * @property {TaskData['title']} title - 작업 카드 제목
 * @property {TaskData['description']} [description] - 작업 설명 (Optional)
 * @property {TaskData['status']} status - 작업 상태
 * @property {TaskData['tags']} tags - 태그 목록 (예: ["기획", "디자인"])
 * @property {string} [createdAt] - 생성일 (ISO Date String)
 * @property {string} [updatedAt] - 수정일 (ISO Date String)
 * @property {string} [dueDate] - 마감일 (ISO Date String)
 * @property {TaskData['assigneeId']} [assigneeId] - 담당자 ID
 * @property {TaskData['assigneeName']} [assigneeName] - 담당자 이름 (백엔드 연동 시 채워짐)
 */

export {}; // 모듈로 인식되도록 export
