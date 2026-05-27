import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [PATCH] 작업 카드 복구 요청
 *
 * (projectId, taskId만 path variable로 전달)
 * @typedef {{ projectId: number, taskId: number }} RequestRestoreTask
 *
 * (204 No Content)
 * @typedef {import('@tanstack/react-query').DefaultError} Error
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, RequestRestoreTask, unknown>}
 */

export const useRestoreTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /** @param {RequestRestoreTask} params */
    mutationFn: async ({ projectId, taskId }) => {
      /** @type {void} */
      return api.patch(`/api/project/${projectId}/task/${taskId}/restore`, {});
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks', variables.projectId],
        // prefix가 ['tasks', projectId]인 모든 쿼리 캐시 무효화
        exact: false,
      });
      notify.success('작업 카드가 복구되었습니다.');
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, '작업 카드 복구에 실패하였습니다.'));
    },
    // onSettled: (data, error, variables, context) => {},
  });
};
