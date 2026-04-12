import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * File Entity 기본 타입
 * @typedef {import('@/features/files/types/file.js').FileData} FileData
 * @typedef {import('@tanstack/react-query').DefaultError} Error
 *
 * [CREATE] 파일 업로드 API 훅
 * - 1단계: /model/uploadUrl 에 projectId, filenames를 보내 Pre-signed URL과 uuid 목록을 발급
 * - 2단계: 발급받은 URL들로 S3에 직접 PUT 업로드 수행
 * - 3단계: /model/upload/complete 에 uuid 목록을 보고하여 메타데이터 저장 요청
 *
 * 업로드용 Pre-signed URL 요청 DTO (클라이언트 → S3)
 * - FileData에서 식별/참조 정보만 사용하는 간단한 형태입니다.
 *   실제 파일 바이너리는 FormData로 전송합니다.
 * @typedef {{
 *   projectId: FileData['projectId'],
 *   taskId: FileData['taskId'],
 *   model: File[],
 * }} RequestFileUploadUrlDTO
 *
 * 업로드용 Pre-signed URL 응답 DTO (S3 → 클라이언트)
 * @typedef {{ uuids: string[], urls: string[] }} ResponseFileUploadUrlDTO
 *
 * 업로드 확인 요청 DTO (클라이언트 → 서버)
 * @typedef {{ uuids: string[] }} RequestFileUploadCompleteDTO
 *
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, RequestFileUploadUrlDTO, unknown>}
 */

export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: 파일 여러 개가 든 배열(model)을 통째로 받습니다.
    /** @param {RequestFileUploadUrlDTO} params */
    mutationFn: async ({ files, projectId }) => {
      // 보낼 파일이 없으면 함수 종료
      if (!files || files.length === 0) return;

      // 1. 백엔드에 여러 파일의 임시 주소(Pre-signed URL)를 한 번에 요청
      const fileNames = files.map((file) => file.name);
      /** @type {ResponseFileUploadUrlDTO} */
      const presignedResponse = await api.post(`/files/uploadUrl`, {
        projectId,
        filenames: fileNames,
      });

      // 백엔드가 준 응답에서 고유 식별표(uuids) 배열과 임시 주소(urls) 배열을 꺼냅니다.
      const { uuids, urls } = presignedResponse;

      // 2. 두 번째 단계: 발급받은 여러 주소(urls)로 S3에 파일들을 동시 다발적(병렬)으로 쏘아 올리기
      // 각 파일마다 fetch 요청을 만드는 '약속(Promise)'들을 배열로 모아둡니다.
      const uploadPromises = files.map(async (file, index) => {
        // 첫 번째 파일은 urls[0] 주소로, 두 번째 파일은 urls[1] 주소로 짝을 지어 보냅니다.
        const response = await fetch(urls[index], {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type, // S3와의 약속: 파일 타입 명시
          },
        });

        if (!response.ok) {
          throw new Error(`${file.name} 업로드 실패`);
        }
      });

      // Promise.all의 마법: 위에서 모아둔 모든 업로드 요청이 S3에 전부 도착할 때까지 기다립니다.
      await Promise.all(uploadPromises);

      // 3. 모든 파일이 S3에 저장되었으므로, 백엔드에 식별표(uuids) 전체를 보고
      /** @param {RequestFileUploadCompleteDTO} */
      return await api.post('/files/upload/complete', uuids);
    },

    // onSuccess (전체 파일 업로드 성공 시)
    onSuccess: async (data, variables) => {
      // 파일 목록 화면을 새로고침하여 새로 올린 파일들이 즉시 보이게 합니다.
      await queryClient.invalidateQueries({ queryKey: ['files', variables.projectId] });
      alert('파일 업로드 성공!');
    },

    // onError (단 하나의 파일이라도 실패 시)
    onError: (error) => {
      console.error('파일 업로드 실패:', error);
      alert(error.message || '파일 업로드 중 오류가 발생했습니다.');
    },
  });
};
