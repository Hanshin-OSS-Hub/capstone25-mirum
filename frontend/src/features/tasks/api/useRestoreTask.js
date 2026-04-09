import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [PATCH] 작업 카드 복구 요청
 *
 * (projectId, taskId만 path variable로 전달)
 * @typedef {{ projectId: number, taskId: number }} RequestRestoreTask
 *
 * (204 No Content)
 * @typedef {import('@tanstack/react-query').DefaultError} Error
 * @return {import('@tanstack/react-query').UseMutationResult<void, Error, RequestRestoreTask, unknown>}
 */

export const useRestoreTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /** @param {RequestRestoreTask} params */
    mutationFn: async ({ projectId, taskId }) => {
      /** @type {void} */
      return api.patch(`/project/${projectId}/task/${taskId}/restore`, {});
    },
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks', variables.projectId],
        // prefix가 ['tasks', projectId]인 모든 쿼리 캐시 무효화
        exact: false,
      });
    },
    onError: (error, variables, context) => {
      console.log('작업 카드 복구 실패:', error);
      alert(error.message || '작업 카드 복구에 실패하였습니다.');
    },
    // onSettled: (data, error, variables, context) => {},
  });
};
