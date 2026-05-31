import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { normalizeFileItem } from '@/features/files/utils/normalizeFileItem.js';

/**
 * File Entity 기본 타입
 * @typedef {import('@/features/files/types/file.js').FileData} FileData
 *
 * [READ] 프로젝트별 파일 목록 조회 API 훅
 *
 * 파일 목록 조회용 DTO (백엔드 응답 형식)
 * - FileData에서 서버 응답에 포함되는 필드만 선택하고,
 *   Date 타입은 문자열(ISO) 기준으로 가정합니다.
 * @typedef {Pick<FileData,
 *   | 'uuid'
 *   | 'projectId'
 *   | 'taskId'
 *   | 'originalFilename'
 *   | 'size'
 *   | 'contentType'
 *   | 'uploadedBy'
 *   | 'previewUrl'
 * > & {
 *   uploadedDate: string  // ISO 문자열 (예: 2026-04-10T12:34:56)
 *   expiredDate?: string | null
 * }} ResponseGetFilesListDTO
 * @typedef {ResponseGetFilesListDTO[]} ResponseGetFilesListDTOArray
 *
 * 정규화된 파일 아이템 타입 (UI에서 사용하는 형태)
 * - /model/project?projectId={id} 응답(ResponseGetFilesListDTOArray)을 가정하고,
 *   FileListItemDTO[] → NormalizedFileItem[] 으로 변환해 반환합니다.
 * @typedef {import('@/features/files/types/file.js').NormalizedFileItem} NormalizedFileItem
 * @typedef {import('@tanstack/react-query').UseQueryResult<NormalizedFileItem[], unknown>} UseGetProjectFilesResult
 * @returns {UseGetProjectFilesResult}
 */

/** @param {number} projectId - 조회할 프로젝트 ID */
export const useGetProjectFiles = (projectId) => {
  const normalizedProjectId = Number(projectId);
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['files', normalizedProjectId],
    /** @returns {Promise<NormalizedFileItem[]>} */
    queryFn: async () => {
      /** @type {ResponseGetFilesListDTOArray} */
      const data = await api.get(`/api/files/project?projectId=${normalizedProjectId}`);
      if (!Array.isArray(data)) return [];
      return data.map(normalizeFileItem);
    },
    enabled: !!normalizedProjectId && isTokenAvailable,
    staleTime: 0, // 갱신 지연 방지
    gcTime: 0,    // 캐시 즉시 만료 (확실한 갱신)
    refetchOnMount: 'always',
  });
};
