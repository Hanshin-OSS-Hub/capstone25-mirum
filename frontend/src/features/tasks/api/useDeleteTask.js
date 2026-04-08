import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [DELETE] 작업 카드 삭제 요청
 * @typedef {import('@/features/tasks/types/task.js').TaskData} TaskData
 * @typedef {import('@/features/tasks/types/task.js').TaskRequestDTO} TaskRequestDTO
 *
 * (삭제 요청은 taskId, projectId 필요)
 * @typedef {Pick<TaskData, 'taskId'>} RequestTaskDeleteDTO
 *
 * (응답은 204 No Content)
 * @typedef {import('@tanstack/react-query').DefaultError} Error
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, { requestData: RequestTaskDeleteDTO, projectId: number }, unknown>}
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /** @param {{ requestData: RequestTaskDeleteDTO, projectId: number }} params */
    mutationFn: ({ requestData, projectId }) => {
      /** @type {void} */
      return api.delete(`project/${projectId}/tasks/${requestData.taskId}`);
    },
    onSuccess: async (data, variables) => {
      // 특정 프로젝트의 작업 목록과 상세 정보 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      await queryClient.invalidateQueries({
        queryKey: ['task', variables.projectId, variables.requestData.taskId],
      });
      console.log('삭제 완료:', data);
      alert('작업 카드가 삭제되었습니다.');
    },
    onError: (error) => {
      console.error('삭제 실패:', error);
      alert(error.message || '작업 카드 삭제에 실패하였습니다.');
    },
  });
};
