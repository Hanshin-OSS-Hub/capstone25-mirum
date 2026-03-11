import {useQuery} from "@tanstack/react-query";
import {api} from "@/api/client.js";

/**
 * [READ] 나(로그인 사용자)에게 온 초대 목록 조회 API
 * @typedef {import('@/api/types/common.js').ApiResponse} InvitationsResponse
 * @returns {import('@tanstack/react-query').UseQueryResult<InvitationsResponse, DefaultError>, InvitationsResponse[]}
 */

export const useGetInviteList = () => {
  return useQuery({
    queryKey: ['invitations', 'received'],
    queryFn: async () => {
      return await api.get('/invitations/received');
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      // 날짜 최신순 정렬
      return [...data].sort((a, b) => {
        ///////////////////
        // 필드명 통일 필요 //
        ///////////////////
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      })
    }
  });
}

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