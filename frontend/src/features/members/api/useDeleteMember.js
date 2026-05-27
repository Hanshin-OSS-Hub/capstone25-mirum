import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [DELETE] 멤버 탈퇴/방출 API
 * @typedef {{ projectId: string|number, targetName: string }} RequestDeleteMemberDTO
 */
export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /** @param {RequestDeleteMemberDTO} params */
    mutationFn: async ({ projectId, targetName }) => {
      /** @type { void }*/
      return await api.delete(`/api/member/${projectId}?targetName=${targetName}`);
    },

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['members', variables.projectId] });
      notify.success('프로젝트 멤버가 삭제되었습니다.');
    },

    onError: (error) => {
      notify.error(getErrorMessage(error, '멤버 삭제에 실패했습니다.'));
    },
  });
};

// [Project.jsx]
// const handleDeleteMemberAPI = (member) => {
//   let deleteConfirmation = false;
//   member.username === myUsername
//     ? (window.confirm("정말로 탈퇴하시겠습니까?") ? deleteConfirmation = true : null)
//     : (
//       window.confirm(`정말로 ${member.nickname} 님을 방출하시겠습니까?`) ? deleteConfirmation = true : null
//     );
//
//   if (deleteConfirmation) {
//     deleteMember({
//       projectId: id,
//       targetName: member.username
//     });
//
//     // 자신이 탈퇴한 경우 대시보드로 이동
//     if (member.username === myUsername) {
//       navigate("/dashboard");
//     }
//   }
// }
