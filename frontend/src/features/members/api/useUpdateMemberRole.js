import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * 폐기 예정
 * [UPDATE] 멤버 권한 수정 API
 * @typedef {{ projectId: string|number, username: string, role: 'LEADER'|'MEMBER' }} UpdateMemberRoleVariables
 * @typedef {import('@/types/common.js').ApiResponse<null>} UpdateRoleResponse
 * @returns {import('@tanstack/react-query').UseMutationResult<UpdateRoleResponse, import('@tanstack/react-query').DefaultError, UpdateMemberRoleVariables, unknown>}
 */
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, username, role }) => {
      /** @type {UpdateRoleResponse} */
      return await api.put(`/member/${projectId}/role`, { username, role });
    },
    onSuccess: async (data, { projectId }) => {
      if (!data?.success) {
        alert(data?.message || '멤버 권한 변경에 실패했습니다.');
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      alert('멤버 권한이 변경되었습니다.');
    },
    onError: (error) => {
      console.error('멤버 권한 변경 실패:', error);
      alert(error.message || '멤버 권한 변경에 실패했습니다.');
    },
  });
};

// [Project.jsx]
// const handleChangeMemberAuthAPI = (targetUsername, role) => {
//   api.put(`member/${id}/role`, {
//     "username": targetUsername,
//     "role": role
//   })
//   .then(() => {
//     alert("멤버 권한을 변경했습니다.");
//     handleGetProjectMembers(); // 멤버 정보 갱신
//   })
//   .catch((error) => {
//     console.error('멤버 권한 변경 실패:', error);
//     alert(error.message || "멤버 권한 변경에 실패했습니다.");
//   });
// }
