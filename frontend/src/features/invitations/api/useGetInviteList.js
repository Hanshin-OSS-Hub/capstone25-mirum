import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/** @typedef {import('@/types/invitation.js').Invitation} Invitation */

/**
 * [READ] 나(로그인 사용자)에게 온 초대 목록 조회 API
 * @param {number | false} [refetchInterval]
 * @param {boolean} [enabled]
 * @returns {import('@tanstack/react-query').UseQueryResult<Invitation[], import('@tanstack/react-query').DefaultError>}
 */
export const useGetInviteList = (refetchInterval = false, enabled = true) => {
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['invitations', 'received'],
    queryFn: async () => {
      /** @type {Invitation[]} */
      return await api.get('/invitations/received');
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    enabled: enabled && isTokenAvailable,
    staleTime: 5000,
    refetchOnMount: 'always',
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      const pendingOnly = data.filter((invite) => invite.status === 'INVITED');
      // 날짜 최신순 정렬 (inviteDate 기준)
      return [...pendingOnly].sort((a, b) => {
        const dateA = new Date(a.inviteDate);
        const dateB = new Date(b.inviteDate);
        return dateB - dateA;
      });
    },
  });
};

// [Home.jsx]
// const handleGetInvitationsApi = async () => {
//   api.get('invitations/received')
//       .then(response => {
//         setReceivedInvitations(response);
//       })
//       .catch(error => {
//         alert(error.message || '초대 목록을 불러오는 데 실패했습니다. 다시 시도해주세요.');
//       });
// };

// const handleGetProjectInvitationsApi2 = useCallback(() => {
//   api.get(`invitations/sent`)
//       .then((data) => {
//         setSentInvitations(data);
//       })
//       .catch((error) => {
//         alert(error.message || "초대 목록을 불러오는데 실패했습니다.");
//       })
// }, [])
