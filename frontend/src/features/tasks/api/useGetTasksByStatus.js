import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 태스크 상태별 목록 조회 API
 * @typedef {{ projectId: number }} RequestGetTaskSummary
 * @param {RequestGetTaskSummary & { status: string }} params
 * @returns {import('@tanstack/react-query').UseQueryResult<ResponseTaskGetSummaryDTO[], unknown>}
 */

export const useGetTasksByStatus = ({ projectId, status }) => {
  const normalizedProjectId = Number(projectId);
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['tasks', normalizedProjectId, status],
    queryFn: async () => {
      /** @type {ResponseTaskGetSummaryDTO[]} */
      return await api.get(`/api/project/${normalizedProjectId}/task/status?status=${status}`);
    },
    staleTime: 0,
    gcTime: 0,
    enabled: !!normalizedProjectId && !!status && isTokenAvailable,
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      return [...data].sort((a, b) => {
        const dateA = new Date(a.updatedDate);
        const dateB = new Date(b.updatedDate);
        return dateB - dateA;
      });
    },
  });
};
