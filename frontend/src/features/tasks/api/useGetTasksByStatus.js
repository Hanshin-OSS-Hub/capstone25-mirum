import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 태스크 상태별 목록 조회 API
 * @typedef {{ projectId: number }} RequestGetTaskSummary
 * @param {RequestGetTaskSummary & { status: string }} params
 * @returns {import('@tanstack/react-query').UseQueryResult<ResponseTaskGetSummaryDTO[], unknown>}
 */

export const useGetTasksByStatus = ({ projectId, status }) => {
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['tasks', Number(projectId), status],
    queryFn: async () => {
      /** @type {ResponseTaskGetSummaryDTO[]} */
      return await api.get(`/project/${projectId}/task/status?status=${status}`);
    },
    enabled: !!projectId && !!status && isTokenAvailable,
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
