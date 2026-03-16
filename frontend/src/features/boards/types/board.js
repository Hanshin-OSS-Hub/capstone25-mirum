/**
 * 보드 타입 (KANBAN, CALENDAR, TIMELINE, FILE_LIBRARY 등)
 * 현재는 KANBAN 위주로 구현
 * @typedef {'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FILE_LIBRARY'} BoardType
 */

/**
 * 보드 설정 객체 (타입별로 다름)
 * @typedef {Object} BoardConfig
 * @property {string[]} [columns] - 칸반 컬럼 목록 (예: ["TODO", "IN_PROGRESS", "DONE"])
 * @property {'MEMBER' | 'STATUS'} [swimlane] - 칸반 스윔레인 기준
 * @property {'MONTH' | 'WEEK'} [viewMode] - 캘린더/타임라인 보기 모드
 */

/**
 * 보드 DTO
 * @typedef {Object} BoardDTO
 * @property {number} boardId - 보드 고유 ID
 * @property {number} projectId - 소속 프로젝트 ID
 * @property {string} name - 보드 이름
 * @property {string} [description] - 보드 설명
 * @property {BoardType} type - 보드 타입
 * @property {BoardConfig} config - 보드 설정
 * @property {string} createdAt - 생성일
 * @property {string} updatedAt - 수정일
 */

export {};
