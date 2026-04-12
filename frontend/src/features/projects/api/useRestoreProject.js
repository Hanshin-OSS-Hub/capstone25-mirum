import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

export const useRestoreProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId) => {
      return await api.post(`project/restore/${projectId}`, {});
    },
    onSuccess: async (data) => {
      // 휴지통 목록 갱신
      await queryClient.invalidateQueries({ queryKey: ['deleted_projects'] });
      // 활성 프로젝트 목록 갱신 (복구된 프로젝트가 보이도록)
      await queryClient.invalidateQueries({ queryKey: ['projects'] });

      console.log('프로젝트 복구 완료:', data);
      alert('프로젝트를 복구했습니다.');
    },
    onError: async (error) => {
      console.log('프로젝트 복구 실패:', error);
      alert(error.message || '프로젝트 복구에 실패했습니다. 다시 시도해주세요.');
    },
  });
};
