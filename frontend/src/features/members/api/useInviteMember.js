import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [CREATE] 프로젝트 초대 API
 * @typedef {{ projectId: number|string, invitedName: string }} RequestInviteMemberDTO
 * @typedef {{ invitationNumber: number }} ResponseInviteMemberDTO
 * @returns {import('@tanstack/react-query').UseMutationResult<ResponseInviteMemberDTO, import('@tanstack/react-query').DefaultError, RequestInviteMemberDTO, unknown> }
 */

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, invitedName, inviterName }) => {
      return await api.post(`/api/invitations`, {
        projectId,
        invitedName,
        inviterName,
      });
    },
    onSuccess: async (_data, { projectId, invitedName }) => {
      await queryClient.invalidateQueries({ queryKey: ['project-invitations', Number(projectId)] });
      notify.success(`${invitedName} 님을 초대했습니다`);
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, '초대 전송에 실패했습니다.'));
    },
  });
};

// [Project.jsx]
// const handleInviteMemberAPI = (userInput) => {
//   api.post(`invitations`, {
//     "projectId": Number(id),
//     "invitedName": userInput
//   })
//       .then(() => {
//         alert(`${userInput}님을 초대했습니다.`);
//         // handleGetProjectMembers(); // Tanstack Query가 자동으로 갱신하므로 필요 없음
//       })
//       .catch((error) => {
//         alert(error.message || "초대에 실패했습니다.");
//       });
// };
