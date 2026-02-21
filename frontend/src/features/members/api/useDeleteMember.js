import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from '@/api/client.js'

/**
 * [DELETE] 멤버 탈퇴/방출 API
 * @typedef {import('@/types/common').ApiResponse<null> } EjectResponse
 * @returns {import('@tanstack/react-query').UseMutationResult<EjectResponse, DefaultError, {readonly projectId?: *, readonly targetName?: *}, unknown>}
 */

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, targetName }) => {
      return await api.delete(`/member/${projectId}?targetName=${targetName}`);
    },

    onSuccess: async (data, { projectId }) => {
      if (data && data.success === false) {
        alert(data.data.detail || '멤버 삭제에 실패했습니다.');
        return;
      }
      await queryClient.invalidateQueries(['members', projectId]);
      alert('프로젝트 멤버가 삭제되었습니다.');
    },

    onError: (error) => {
      console.error('멤버 삭제 실패:', error);
      alert(error.message || '멤버 삭제에 실패했습니다.');
    }
  })
}