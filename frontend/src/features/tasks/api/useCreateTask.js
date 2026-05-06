import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [CREATE] 새 작업 카드 생성 API
 * @typedef {import('@/types/task.js').TaskData} TaskData
 * @typedef {import('@/types/task.js').TaskRequestDTO} TaskRequestDTO
 *
 * (공통 TaskRequestDTO에서 title만 필수, 나머지는 옵셔널로 처리)
 * @typedef {Pick<TaskRequestDTO, 'title'> & Partial<Omit<TaskRequestDTO, 'title'>>} RequestTaskCreateDTO
 *
 * (응답은 생성된 작업 카드의 ID만 포함)
 * @typedef {{ taskId: number }} ResponseTaskCreate
 * @typedef {import('@tanstack/react-query').DefaultError} Error
 * @returns {import('@tanstack/react-query').UseMutationResult<ResponseTaskCreate, Error, { requestBody: RequestTaskCreateDTO, projectId: number }, unknown>}
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /** @param {{ requestBody: RequestTaskCreateDTO, projectId: number }} params */
    mutationFn: async ({ requestBody, projectId }) => {
      /** @type {ResponseTaskCreate} */
      return await api.post(`project/${projectId}/task`, requestBody);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', Number(variables.projectId)] });
      notify.success('작업 카드가 생성되었습니다.');
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, '작업 카드 생성에 실패하였습니다.'));
    },
  });
};
