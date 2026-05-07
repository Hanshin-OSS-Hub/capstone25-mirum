import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [UPDATE] 프로젝트 초대 수락 API
 * @typedef {import('@/types/common.js').ApiResponse<null>} AcceptResponse
 * @returns {import('@tanstack/react-query').UseMutationResult<AcceptResponse, import('@tanstack/react-query').DefaultError, number, unknown>}
 */

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId) => {
      return await api.post(`/invitations/${inviteId}/accept`, {});
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['invitations', 'received'] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      notify.success('프로젝트 초대를 수락했습니다.');
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, '초대 처리에 실패했습니다.'));
    },
  });
};

// [Home.jsx]
// const handleAcceptInvitationApi = async (invitationId) => {
//       return api.post(`/invitations/${invitationId}/accept`)
//           .then(() => {
//             setReceivedInvitations(prev => prev.filter(inv => inv.inviteId !== invitationId));
//             alert('프로젝트 초대를 수락했습니다.');
//             // 초대 수락 후 프로젝트 목록 갱신
//             handleGetProjectList();
//           })
//           .catch(error => {
//             alert(error.message || '초대 수락에 실패했습니다. 다시 시도해주세요.');
//           });
//     };
//
// [InvitationModal.jsx]
// const handleAccept = async (inviteId) => {
//   setLoadingId(inviteId);
//   try {
//     if (props.onAccept) {
//       await props.onAccept(inviteId);
//     }
//   } finally {
//     setLoadingId(null);
//   }
// };
