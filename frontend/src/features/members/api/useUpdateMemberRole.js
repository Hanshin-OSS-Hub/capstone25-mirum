import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * todo 리더 양도 기능 지원할건지 논의
 * [UPDATE] 멤버 권한 수정 API
 * @typedef {{ projectId: string|number, username: string, role: 'LEADER'|'MEMBER' }} RequestUpdateMemberRole
 * @returns {import('@tanstack/react-query').UseMutationResult<void, import('@tanstack/react-query').DefaultError, RequestUpdateMemberRole, unknown>}
 */
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /** @param {RequestUpdateMemberRole} params */
    mutationFn: async ({ projectId, username, role }) => {
      // client.js에서 응답 제네릭을 처리하므로 여기서는 반환값을 사용하지 않습니다.
      await api.put(`/api/member/${projectId}/role`, { username, role });
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['members', variables.projectId] });
      notify.success('멤버 권한이 변경되었습니다.');
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, '멤버 권한 변경에 실패했습니다.'));
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
