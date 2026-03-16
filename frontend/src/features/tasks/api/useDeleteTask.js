import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => {
      return api.delete(`/tasks/${taskId}`);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries(['tasks', data.boardId]);
      console.log(data);
      alert('작업 카드가 삭제되었습니다.');
    },
    onError: (error) => {
      console.log(error);
      alert(error.message || '작업 카드 삭제에 실패하였습니다.');
    },
  });
};
