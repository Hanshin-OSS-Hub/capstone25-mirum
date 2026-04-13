import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [CREATE] 프로젝트 초대 API
 * @typedef {{ projectId: number|string, invitedName: string }} InviteMemberVariables
 * @returns {import('@tanstack/react-query').UseMutationResult<null, import('@tanstack/react-query').DefaultError, InviteMemberVariables, unknown> }
 */

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, invitedName }) => {
      return await api.post(`/invitations`, {
        projectId,
        invitedName,
      });
    },
    onSuccess: async (_data, { projectId, invitedName }) => {
      await queryClient.invalidateQueries({ queryKey: ['project-invitations', projectId] });
      alert(`${invitedName} 님을 초대했습니다`);
    },
    onError: (error) => {
      console.log('초대 실패: ', error);
      alert(error.message || '초대 전송에 실패했습니다.');
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
//         console.log(error);
//       });
// };
