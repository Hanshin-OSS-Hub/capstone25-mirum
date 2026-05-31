import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [UPDATE] 작업 카드 수정 요청
 * @typedef {import('@/types/task.js').TaskData} TaskData
 * @typedef {import('@/types/task.js').TaskRequestDTO} TaskRequestDTO
 *
 * (공통 TaskRequestDTO에서 taskId만 필수, 나머지는 옵셔널로 처리)
 * @typedef {Pick<TaskData, 'taskId'> &
 *   Partial<Omit<TaskData, 'taskId' | 'createdDate' | 'updatedDate'>>} RequestTaskUpdateDTO
 *
 * (수정된 작업 카드의 전체 정보를 반환)
 * @typedef {import('@tanstack/react-query').DefaultError} Error
 * @returns {import('@tanstack/react-query').UseMutationResult<
 *   TaskData,
 *   Error,
 *   { requestData: RequestTaskUpdateDTO, projectId: number },
 *   unknown
 * >}
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /** @param {{ requestData: RequestTaskUpdateDTO, projectId: number }} params */
    mutationFn: ({ requestData, projectId }) => {
      /** @type {TaskData} */
      return api.patch(`/api/project/${projectId}/task/${requestData.taskId}`, requestData);
    },
    onSuccess: async (_data, variables) => {
      const pId = Number(variables.projectId);
      const tId = Number(variables.requestData.taskId);

      // 특정 프로젝트의 작업 목록과 상세 정보 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ['tasks', pId] });
      await queryClient.invalidateQueries({
        queryKey: ['task', pId, tId],
      });
      notify.success('작업 카드가 수정되었습니다.');
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, '작업 카드 수정에 실패하였습니다.'));
    },
  });
};
