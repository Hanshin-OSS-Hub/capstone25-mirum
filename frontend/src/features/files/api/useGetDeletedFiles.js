import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 삭제된 파일 목록 조회 API 훅
 * @param projectId
 */
export const useGetDeletedFiles = (projectId) => {
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['files', 'deleted', projectId],
    queryFn: async () => {
      return api.get(`/files/deleted?projectId=${projectId}`);
    },
    enabled: !!projectId && isTokenAvailable, // projectId와 토큰이 준비되었을 때만 실행
  });
};
