import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [DELETE] 작업 카드 삭제 요청
 *
 * (삭제 요청은 path variable로 taskId, projectId 필요)
 *  @typedef {{ taskId: number, projectId: number }} RequestTaskDelete
 * (응답은 204 No Content)
 * @typedef {import('@tanstack/react-query').DefaultError} Error
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, RequestTaskDelete, unknown>}
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * @param RequestTaskDelete
     * @param RequestTaskDelete.taskId
     * @param RequestTaskDelete.projectId
     */
    mutationFn: ({ taskId, projectId }) => {
      /** @type {void} */
      return api.delete(`project/${projectId}/task/${taskId}`);
    },
    onSuccess: async (_data, variables) => {
      // 특정 프로젝트의 작업 목록과 상세 정보 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      await queryClient.invalidateQueries({
        queryKey: ['task', variables.projectId, variables.taskId],
      });
      notify.success('작업 카드가 삭제되었습니다.');
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, '작업 카드 삭제에 실패하였습니다.'));
    },
  });
};
