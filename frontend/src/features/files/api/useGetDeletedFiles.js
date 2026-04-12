import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/** [READ] 삭제된 파일 목록 조회 API 훅 */
export const useGetDeletedFiles = (projectId) => {
  return useQuery({
    queryKey: ['files', 'deleted', projectId],
    queryFn: async () => {
      return api.get(`/files/deleted?projectId=${projectId}`);
    },
    initialData: [],
    enabled: !!projectId, // projectId가 있을 때만 쿼리 실행
  });
};
