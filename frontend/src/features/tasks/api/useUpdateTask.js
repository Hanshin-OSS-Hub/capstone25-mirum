import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskData) => {
      return api.patch('/tasks', taskData);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.log(data);
      alert('작업 카드가 수정되었습니다.');
    },
    onError: (error) => {
      console.log(error);
      alert(error.message || '작업 카드 수정에 실패하였습니다.');
    },
  });
};
