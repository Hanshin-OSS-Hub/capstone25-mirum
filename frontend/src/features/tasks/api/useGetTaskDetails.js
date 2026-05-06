import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 작업 카드 상세정보 조회 API
 * @typedef {import('@/types/task.js').TaskData} TaskData
 * @typedef {{ projectId: number, taskId: number }} RequestGetTaskDetailsDTO
 * @param {RequestGetTaskDetailsDTO} params
 * @see TaskDetailDTO
 * @see ../../../../../backend/src/main/java/backend/dto/Tasks/TaskDetailDTO.java
 * @returns {import('@tanstack/react-query').UseQueryResult<TaskData, unknown>}
 */

export const useGetTaskDetails = ({ projectId, taskId }) => {
  return useQuery({
    queryKey: ['task', projectId, taskId],
    /** @type {TaskData} */
    queryFn: async () => {
      return await api.get(`/project/${projectId}/task/${taskId}`);
    },
    // 초기값을 배열로 설정하면 상세 조회(객체) 결과와 타입이 맞지 않으므로 undefined 사용 권장
    initialData: undefined,
  });
};
