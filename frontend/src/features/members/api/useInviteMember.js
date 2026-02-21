import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [CREATE] 프로젝트 초대 API
 * @typedef {import('@/types/member').UnifiedMember } UnifiedMember
 * @typedef {import('@/types/common').ApiResponse<UnifiedMember[]> } UserListResponse
 * @returns {import('@tanstack/react-query').DefinedUseMutationResult<UserListResponse, DefaultError, {readonly projectId?: *, readonly invitedName?: *}, unknown> }
 */

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, invitedName }) => {
      return await api.post(`/invitations`, {
        projectId,
        invitedName
      })
    },
    onSuccess: async (data, { projectId, invitedName }) => {
      // 서버가 200 OK를 줬지만, 내부적으로 실패 메시지를 보낸 경우
      // if (data && data.success === false) {
      //   alert(data.data.detail || '초대 처리에 실패했습니다.');
      //   return;
      // }
      // 성공 시: 목록 갱신이 확실히 끝난 뒤에 알림 -> 데이터 일관성 보장
      await queryClient.invalidateQueries({ queryKey: ['project-invitations', projectId] });
      alert(`${invitedName} 님을 초대했습니다`);
    },
    onError: (error) => {
      console.log('초대 실패: ', error);
      alert(error.message || '초대 전송에 실패했습니다.');
    }
  });
}