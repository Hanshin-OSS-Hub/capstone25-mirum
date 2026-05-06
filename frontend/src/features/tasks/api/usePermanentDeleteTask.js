/**
 * backend 협의 후 구현 예정
 * 엔드포인트 / 데이터 전달 방식 체크 필요
 */
/**
 * [DELETE] 작업 카드 영구 삭제 요청
 * @typedef {{ projectId: number, taskId: number }} requestPermanentDeleteTask
 * @typedef {import('@tanstack/react-query').DefaultError} Error
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, requestPermanentDeleteTask, unknown>}
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

export const usePermanentDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /**
     * @param root0
     * @param root0.projectId
     * @param root0.taskId
     */
    mutationFn: ({ projectId, taskId }) => {
      /** @type {{ void }} */
      return api.delete(`project/${projectId}/task/${taskId}/permanent`, {});
    },
    onSuccess: async (_data, variables) => {
      // 특정 프로젝트의 작업 목록과 상세 정보 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      await queryClient.invalidateQueries({
        queryKey: ['task', variables.projectId, variables.taskId],
      });
      notify.success('작업 카드가 영구 삭제되었습니다.');
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, '작업 카드 삭제에 실패하였습니다.'));
    },
  });
};
