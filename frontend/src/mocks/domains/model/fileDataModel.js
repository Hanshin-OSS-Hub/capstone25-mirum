import rawDeletedFilesData from '@global/data/dummyDeletedFiles.json';
import rawFilesData from '@global/data/dummyFiles.json';

/**
 * @typedef {import('@/features/files/types/file.js').FileData} FileData
 */

/**
 * model.json 데이터를 앱에서 사용할 수 있는 FileData[] 타입으로 변환하고 관리하는 메모리 DB 모델입니다.
 * @type {FileData[]}
 */
export const filesDB = rawFilesData.map((file) => ({
  // 기본 식별자
  uuid: file.uuid,
  // 참조 정보
  projectId: file.projectId,
  taskId: file.taskId,
  // 파일 메타데이터
  originalFilename: file.originalFilename,
  size: file.size,
  contentType: file.contentType,
  // 업로드 정보 (uploaded* 네이밍으로 통일)
  uploadedBy: file.uploadedBy,
  uploadedDate: new Date(file.uploadedDate ?? file.createdDate),
  // 선택 필드
  previewUrl: file.previewUrl,
  expiredDate: file.expiredDate ? new Date(file.expiredDate) : null,
  // 삭제 관련
  isDeleted: false,
  deletedDate: null,
}));

// 삭제된 파일 메모리 DB
export const deletedFilesDB = rawDeletedFilesData.map((file) => ({
  // 기본 식별자
  uuid: file.uuid,
  // 참조 정보
  projectId: file.projectId,
  taskId: file.taskId,
  // 파일 메타데이터
  originalFilename: file.originalFilename,
  size: file.size,
  contentType: file.contentType,
  // 업로드 정보 (uploaded* 네이밍으로 통일)
  uploadedBy: file.uploadedBy,
  uploadedDate: new Date(file.uploadedDate ?? file.createdDate),
  // 선택 필드
  previewUrl: file.previewUrl,
  expiredDate: file.expiredDate ? new Date(file.expiredDate) : null,
  // 삭제 관련
  deletedDate: new Date(file.deletedDate),
  isDeleted: true,
}));
