import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 삭제된 파일 목록 조회 API 훅
 * @param projectId
 */
export const useGetDeletedFiles = (projectId) => {
  const normalizedProjectId = Number(projectId);
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['files', 'deleted', normalizedProjectId],
    queryFn: async () => {
      return api.get(`/api/files/deleted?projectId=${normalizedProjectId}`);
    },
    staleTime: 0,
    gcTime: 0,
    enabled: !!normalizedProjectId && isTokenAvailable,
  });
};
