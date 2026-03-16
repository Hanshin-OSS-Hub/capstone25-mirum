export const taskStatus = {
  todo: 'TODO',
  inProgress: 'IN_PROGRESS',
  done: 'DONE',
  deleted: 'DELETED',
  archived: 'ARCHIVED',
};

/**
 * [목록 조회용] 작업 요약 정보 DTO
 * @typedef {Object} TaskSummaryDTO
 * @property {number} taskId - 작업 카드 고유 ID
 * @property {string} title - 작업 카드 제목
 * @property {string} [description] - 작업 설명 (Optional)
 * @property {taskStatus} status - 작업 상태
 * @property {string[]} tags - 태그 목록 (예: ["기획", "디자인"])
 * @property {string} [createdAt] - 생성일 (ISO Date String)
 * @property {string} [updatedAt] - 수정일 (ISO Date String)
 * @property {string} [dueDate] - 마감일 (ISO Date String)
 * @property {number} [assigneeId] - 담당자 ID
 * @property {string} [assigneeName] - 담당자 이름 (백엔드 연동 시 채워짐)
 */

/**
 * [상세 조회용] 작업 상세 정보 DTO
 * @typedef {Object} TaskDetailDTO
 * @property {number} boardId - 소속 보드 ID (외래키)
 * @property {number} taskId - 작업 카드 고유 ID
 * @property {string} title - 작업 카드 제목
 * @property {string} [description] - 작업 설명
 * @property {taskStatus} status - 작업 상태
 * @property {string[]} tags - 태그 목록
 * @property {string} [notes] - 마크다운 노트 (상세 내용)
 * @property {string} [createdAt] - 생성일
 * @property {string} [updatedAt] - 수정일
 * @property {string} [dueDate] - 마감일
 * @property {number} [assigneeId] - 담당자 ID
 * @property {string} [assigneeName] - 담당자 이름
 * @property {string} [assigneeProfileImage] - 담당자 프로필 이미지 URL
 */

/**
 * [생성 요청용] 작업 생성 요청 DTO
 * @typedef {Object} TaskRequestDTO
 * @property {number} boardId - 소속 보드 ID (필수)
 * @property {number} projectId - 소속 프로젝트 ID (검증용, 필수)
 * @property {string} title - 작업 제목 (필수)
 * @property {string} [description] - 작업 설명
 * @property {taskStatus} [status] - 초기 상태 (기본값: TODO)
 * @property {string[]} [tags] - 태그 목록
 * @property {string} [notes] - 마크다운 노트
 * @property {number} [assigneeId] - 담당자 ID
 * @property {string} [dueDate] - 마감일 (ISO Date String, YYYY-MM-DD)
 */

/**
 * [수정 요청용] 작업 수정 요청 DTO
 * @typedef {Object} TaskUpdateRequestDTO
 * @property {number} [boardId] - 보드 이동 시 사용
 * @property {number} [projectId] - 프로젝트 이동 시 사용 (드묾)
 * @property {string} [title] - 수정할 제목
 * @property {string} [description] - 수정할 설명
 * @property {taskStatus} [status] - 변경할 상태
 * @property {string[]} [tags] - 수정할 태그 목록
 * @property {string} [notes] - 수정할 노트
 * @property {number} [assigneeId] - 담당자 변경
 * @property {string} [dueDate] - 마감일 변경
 */

export {}; // 모듈로 인식되도록 export
