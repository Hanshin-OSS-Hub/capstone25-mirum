import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [DELETE] 프로젝트 영구 삭제 API
 */
export const usePermanentDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId) => {
      // 영구 삭제를 위한 전용 엔드포인트 가정 (Spring Boot 스펙에 맞춤)
      return await api.delete(`/project/${projectId}/permanent`);
    },
    onSuccess: async () => {
      // 휴지통 목록 갱신
      await queryClient.invalidateQueries({ queryKey: ['deleted_projects'] });
      notify.success('프로젝트가 영구적으로 삭제되었습니다.');
    },
    onError: async (error) => {
      notify.error(getErrorMessage(error, '영구 삭제에 실패했습니다.'));
    },
  });
};
