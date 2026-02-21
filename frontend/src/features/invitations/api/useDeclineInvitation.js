import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client.js";

/**
 * [UPDATE] 프로젝트 초대 거절 API
 * @typedef {import('@/types/common').ApiResponse<null>} AcceptResponse
 * @returns {import('@tanstack/react-query').UseMutationResult<AcceptResponse, import('@tanstack/react-query').DefaultError, number, unknown>}
 */

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId) => {
      return await api.put(`/invitations/${inviteId}/decline`, {});
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['invitations', 'received']});
      alert('프로젝트 초대를 거절했습니다.');
    },
    onError: (error) => {
      console.log('초대 처리 실패: ', error);
      alert(error.message || '초대 처리에 실패했습니다.');
    },
  })
}

// [Home.jsx]
// const handleRejectInvitationApi = async (invitationId) => {
//       return api.put(`/invitations/${invitationId}/decline`)
//           .then(() => {
//             setReceivedInvitations(prev => prev.filter(inv => inv.inviteId !== invitationId));
//             alert('프로젝트 초대를 거절했습니다.');
//           })
//           .catch(error => {
//             alert(error.message || '초대 거절에 실패했습니다. 다시 시도해주세요.');
//           });
//     };
//
// [invitationModal.jsx]
// const handleReject = async (inviteId) => {
//   setLoadingId(inviteId);
//   try {
//     if (props.onReject) {
//       await props.onReject(inviteId);
//     }
//   } finally {
//     setLoadingId(null);
//   }
// };