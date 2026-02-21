import { useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from "@/api/client.js";

/**
 * [UPDATE] 멤버 권한 수정 API
 * @typedef {import('@/types/common').ApiResponse<null> } UpdateRoleResponse
 * @returns {import('@tanstack/react-query').UseMutationResult<UpdateRoleResponse, DefaultError, {readonly projectId?: *, readonly username?: *, readonly role?: *}, unknown>}
 */

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, username, role }) => {
      return await api.put(`/member/${projectId}/role`, {username, role});
    },
    onSuccess: async (data, { projectId }) => {
      if (data && data.success === false) {
        alert(data.data.detail || "멤버 권한 변경에 실패했습니다.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['members', projectId]});
      alert("멤버 권한이 변경되었습니다.");
    },

    onError: (error) => {
      console.error('멤버 권한 변경 실패:', error);
      alert(error.message || "멤버 권한 변경에 실패했습니다.");
    }
  })
}