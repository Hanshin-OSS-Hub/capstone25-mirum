/**
 * File Entity 속성 정의
 * @typedef {Object} FileData
 * @property {string} uuid - 파일 고유 ID
 * @property {number} [projectId] - 소속 프로젝트 ID (선택)
 * @property {number} [taskId] - 소속 작업 카드 ID (Task = 폴더 역할)
 * @property {string} originalFilename - 원본 파일명
 * @property {number} size - 파일 크기(바이트)
 * @property {string} contentType - MIME 타입 (예: image/png, application/pdf)
 * @property {string | null} [previewUrl] - (선택) 썸네일/미리보기 URL
 * @property {Date} uploadedDate - 업로드/생성 일시
 * @property {string} uploadedBy - 업로드한 사용자 ID 또는 이름
 * @property {Date | null} [expiredDate] - (선택) 만료 일시, 없으면 null
 * @property {boolean} [isDeleted] - 삭제 여부 플래그 (메모리 DB용)
 * @property {Date | null} [deletedDate] - 삭제 일시 (삭제된 파일 전용)
 */

/**
 * 파일 뷰에서 사용하는 정규화된 아이템 타입
 * - FileData 기반으로 UI에서 사용하는 파생 필드를 추가한 형태입니다.
 * @typedef {Pick<FileData,
 *   | 'uuid'
 *   | 'originalFilename'
 *   | 'size'
 *   | 'contentType'
 *   | 'previewUrl'
 *   | 'uploadedBy'
 * > & {
 *   uploadedDate: string  // 포맷 전 원본 문자열
 *   displaySize: string   // UI 표시용 파일 크기 (예: "1.2 MB")
 *   displayDate: string   // UI 표시용 업로드 날짜 (예: "2026-04-10")
 *   category: string      // 파일 카테고리 (fileCategory 중 하나)
 *   extensionLabel?: string // 확장자 라벨 (예: "PDF", "PNG")
 * }} NormalizedFileItem
 */

/**
 * FileListTable에서 사용하는 리스트 아이템 타입
 * - NormalizedFileItem 기반에 테이블 전용 필드를 포함한 형태입니다.
 * @typedef {NormalizedFileItem & {
 *   downloadUrl?: string | null,
 *   itemCount?: number | null,
 * }} FileListItem
 *
 * FileListTable 컴포넌트 props 타입
 * @typedef {Object} FileListTableProps
 * @property {FileListItem[]} items
 * @property {string[]} [selectedFileIds]
 * @property {(item: FileListItem) => void} [onToggleItemSelect]
 * @property {() => void} [onToggleAllSelect]
 * @property {(item: FileListItem) => void} [onDownloadItem]
 * @property {'size' | 'uploadedDate'} [sortKey]
 * @property {'asc' | 'desc'} [sortOrder]
 * @property {() => void} [onToggleSizeSort]
 * @property {() => void} [onToggleDateSort]
 */

export const fileCategory = {
  all: 'all',
  folder: 'folder',
  media: 'media',
  document: 'document',
};

export const fileViewMode = {
  list: 'list',
  grid: 'grid',
};

export const folderContentType = 'application/x-folder';

export {}; // 모듈로 인식되도록 export
