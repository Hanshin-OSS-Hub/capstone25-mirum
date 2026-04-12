import { deletedFilesDB, filesDB } from '@/mocks/domains/model/fileDataModel.js';
import { http } from 'msw';
import { errorResponse, successResponse } from '../common.js';

// in-memory mock for uploaded file metadata (간단한 시뮬레이션용)
let uploadedFilesMeta = [];

export const fileHandlers = [
  // [GET] 프로젝트 첨부 파일 조회
  // 실제 훅(useGetProjectFiles)이 호출하는 엔드포인트 스펙:
  // GET /api/model/project?projectId={id}
  /** @link useGetProjectFiles */
  http.get('*/api/files/project', async ({ request }) => {
    const url = new URL(request.url);
    const projectIdParam = url.searchParams.get('projectId');

    if (!projectIdParam) return errorResponse('잘못된 요청입니다. projectId가 필요합니다.', 400);

    const projectId = Number(projectIdParam);
    if (Number.isNaN(projectId)) {
      return errorResponse('projectId 형식이 올바르지 않습니다.', 400);
    }

    // 1) 메모리 DB에서 프로젝트별 파일 필터링 (삭제되지 않은 파일만)
    const files = filesDB.filter((file) => file.projectId === projectId && !file.isDeleted);

    // 2) FileData(Date 타입) → Response DTO(JSON) 변환
    const fileDtoList = files.map((file) => ({
      uuid: file.uuid,
      projectId: file.projectId,
      taskId: file.taskId,
      originalFilename: file.originalFilename,
      size: file.size,
      contentType: file.contentType,
      previewUrl: file.previewUrl,
      uploadedBy: file.uploadedBy,
      uploadedDate: file.uploadedDate.toISOString(),
      expiredDate: file.expiredDate ? file.expiredDate.toISOString() : null,
    }));

    console.log(
      `MSW: 프로젝트 ${projectId}의 첨부 파일 조회 완료 - 총 ${fileDtoList.length}개 파일`,
    );

    // useGetProjectFiles는 배열을 기대하므로 그대로 반환
    return successResponse(fileDtoList, 200);
  }),

  // [POST] 단체 Pre-signed URL 발급 요청
  // 프론트 훅 useUploadFiles 기준 스펙:
  // POST /api/model/uploadUrl
  // body: { projectId: number, filesnames: string[] }
  // response: { uuids: string[], urls: string[] }
  /** @link useUploadFiles */
  http.post('*/api/files/uploadUrl', async ({ request }) => {
    // MSW의 request.json()은 넓은 타입(any)에 가깝기 때문에,
    // 먼저 any로 받은 뒤, 우리가 정의한 DTO 타입으로 좁혀서 사용합니다.
    /** @type {any} */
    const rawBody = await request.json();
    /** @type {import('@/features/files/api/useUploadFiles.js').RequestFileUploadUrlDTO} */
    const body = rawBody;
    const { projectId, filesnames } = body;

    if (!projectId || !Array.isArray(filesnames) || filesnames.length === 0) {
      return errorResponse('잘못된 요청입니다. projectId와 filesnames가 필요합니다.', 400);
    }

    const uuids = [];
    const urls = [];

    filesnames.forEach((filename, index) => {
      const uuid = `mock-file-${Date.now()}-${index}`;
      const mockUploadUrl = `https://mock-s3-bucket.com/temp-upload/${uuid}`;

      uuids.push(uuid);
      urls.push(mockUploadUrl);

      // 업로드 메타를 간단히 적재해 두었다가 /upload/complete에서 참조할 수 있게 합니다.
      uploadedFilesMeta.push({ uuid, projectId, originalFilename: filename });
    });

    console.log(`MSW: 단체 임시 주소 발급 완료 - 총 ${filesnames.length}개 파일`);

    return successResponse({ uuids, urls }, 200);
  }),

  // [POST] 단체 파일 업로드 결과 최종 보고
  // 프론트 훅 useUploadFiles 기준 스펙:
  // POST /api/model/upload/complete
  // body: null
  /** @link useUploadFiles */
  http.post('*/api/files/upload/complete', async ({ request }) => {
    /** @type {any} */
    const rawBody = await request.json();
    /** @type {import('@/features/files/api/useUploadFiles.js').RequestFileUploadCompleteDTO | string[] } */
    const body = rawBody;
    const uuids = Array.isArray(body) ? body : body.uuids;

    if (!Array.isArray(uuids)) {
      return errorResponse('잘못된 요청입니다. uuids 배열이 필요합니다.', 400);
    }

    console.log(`MSW: 업로드 완료 보고 수신 - 파일 수: ${uuids.length}개`);

    uuids.forEach((uuid) => {
      const meta = uploadedFilesMeta.find((m) => m.uuid === uuid);

      if (!meta) return;

      filesDB.push({
        uuid: meta.uuid,
        projectId: meta.projectId,
        taskId: meta.taskId ?? null,
        originalFilename: meta.originalFilename,
        size: meta.size ?? null,
        contentType: meta.contentType ?? 'application/octet-stream',
        previewUrl: null,
        uploadedBy: 'mock-uploader',
        uploadedDate: new Date(),
        expiredDate: null,
        isDeleted: false,
        deletedDate: null,
      });
    });

    return successResponse({ message: '모든 파일 업로드 결과 보고 완료' }, 200);
  }),

  // [POST] 파일 다운로드 URL 발급
  // useDownloadFiles 훅 스펙:
  // POST /api/model/downloadUrl
  // body: string[] (uuids)
  // response: { uuid, url }[]
  /** @link useDownloadFiles */
  http.post('*/api/files/downloadUrl', async ({ request }) => {
    /** @type {any} */
    const rawBody = await request.json();
    const uuids = Array.isArray(rawBody) ? rawBody : rawBody.uuids;

    if (!Array.isArray(uuids) || uuids.length === 0) {
      return errorResponse('잘못된 요청입니다. uuid 배열이 필요합니다.', 400);
    }

    const result = uuids.map((uuid) => ({
      uuid,
      // 실제 서비스에서는 백엔드에서 Presigned URL 또는 다운로드 API URL을 내려줌
      url: `https://mock-download-server.com/files/${uuid}`,
    }));

    console.log(`MSW: 다운로드 URL 발급 완료 - 총 ${result.length}개 파일`);

    return successResponse(result, 200);
  }),

  // [POST] 파일 소프트 삭제
  // useDeleteFiles 훅 스펙:
  // POST /api/model/softDelete
  // body: string[] (uuids)
  /** @link useDeleteFiles */
  http.post('*/api/files/softDelete', async ({ request }) => {
    /** @type {any} */
    const rawBody = await request.json();
    const uuids = Array.isArray(rawBody) ? rawBody : rawBody.uuids;

    if (!Array.isArray(uuids) || uuids.length === 0) {
      return errorResponse('잘못된 요청입니다. uuid 배열이 필요합니다.', 400);
    }

    // 간단히 isDeleted 플래그만 true로 설정 (실제 deletedFilesDB로 옮기는 것은 생략)
    uuids.forEach((uuid) => {
      const file = filesDB.find((f) => f.uuid === uuid);
      if (file) {
        file.isDeleted = true;
        file.deletedDate = new Date();
      }
    });

    console.log(`MSW: 소프트 삭제 처리 완료 - 총 ${uuids.length}개 파일`);

    return successResponse({ message: '파일이 논리 삭제되었습니다.' }, 200);
  }),

  // [POST] 파일 영구 삭제
  // usePermanentDeleteFiles 훅 스펙:
  // POST /api/model/realDelete
  // body: string[] (uuids)
  /** @link usePermanentDeleteFiles */
  http.post('*/api/files/realDelete', async ({ request }) => {
    /** @type {any} */
    const rawBody = await request.json();
    const uuids = Array.isArray(rawBody) ? rawBody : rawBody.uuids;

    if (!Array.isArray(uuids) || uuids.length === 0) {
      return errorResponse('잘못된 요청입니다. uuid 배열이 필요합니다.', 400);
    }

    // filesDB에서 해당 uuid를 가진 항목 제거
    uuids.forEach((uuid) => {
      const index = filesDB.findIndex((f) => f.uuid === uuid);
      if (index !== -1) {
        filesDB.splice(index, 1);
      }
    });

    console.log(`MSW: 영구 삭제 처리 완료 - 총 ${uuids.length}개 파일`);

    return successResponse({ message: '파일이 영구 삭제되었습니다.' }, 200);
  }),

  // [PATCH] 삭제된 파일 복구
  // useRestoreFiles 훅 스펙:
  // PATCH /api/model/restore
  // body: string[] (uuids)
  /** @link useRestoreFiles */
  http.patch('*/api/files/restore', async ({ request }) => {
    /** @type {any} */
    const rawBody = await request.json();
    const uuids = Array.isArray(rawBody) ? rawBody : rawBody.uuids;

    if (!Array.isArray(uuids) || uuids.length === 0) {
      return errorResponse('잘못된 요청입니다. uuid 배열이 필요합니다.', 400);
    }

    uuids.forEach((uuid) => {
      const file = filesDB.find((f) => f.uuid === uuid);
      if (file) {
        file.isDeleted = false;
        file.deletedDate = null;
      }
    });

    console.log(`MSW: 삭제 파일 복구 처리 완료 - 총 ${uuids.length}개 파일`);

    return successResponse({ message: '파일이 복구되었습니다.' }, 200);
  }),

  // [GET] 삭제된 파일 목록 조회
  // useGetDeletedFiles 훅 스펙:
  // GET /api/model/deleted?projectId={id}
  /** @link useGetDeletedFiles */
  http.get('*/api/files/deleted', async ({ request }) => {
    const url = new URL(request.url);
    const projectIdParam = url.searchParams.get('projectId');

    if (!projectIdParam) return errorResponse('잘못된 요청입니다. projectId가 필요합니다.', 400);

    const projectId = Number(projectIdParam);
    if (Number.isNaN(projectId)) {
      return errorResponse('projectId 형식이 올바르지 않습니다.', 400);
    }

    // filesDB에서 isDeleted가 true인 항목 + deletedFilesDB를 함께 고려할 수 있음
    const softDeleted = filesDB.filter((file) => file.projectId === projectId && file.isDeleted);
    const hardDeleted = deletedFilesDB.filter((file) => file.projectId === projectId);

    const allDeleted = [...softDeleted, ...hardDeleted];

    const dtoList = allDeleted.map((file) => ({
      uuid: file.uuid,
      projectId: file.projectId,
      taskId: file.taskId,
      originalFilename: file.originalFilename,
      size: file.size,
      contentType: file.contentType,
      previewUrl: file.previewUrl,
      uploadedBy: file.uploadedBy,
      uploadedDate: (file.uploadedDate ?? file.createdDate).toISOString(),
      expiredDate: file.expiredDate ? file.expiredDate.toISOString() : null,
      deletedDate: file.deletedDate ? file.deletedDate.toISOString() : null,
    }));

    console.log(
      `MSW: 프로젝트 ${projectId}의 삭제된 첨부 파일 조회 완료 - 총 ${dtoList.length}개 파일`,
    );

    return successResponse(dtoList, 200);
  }),
];
