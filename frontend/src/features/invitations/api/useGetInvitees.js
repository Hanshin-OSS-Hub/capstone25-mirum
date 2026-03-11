import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 초대 받은 유저 목록 조회 API
 * @param {string|number} projectId
 * @typedef {import('@/features/members/types/unifiedUser.js').UnifiedUser} UnifiedUser
 * @typedef {import('@/api/types/common.js').ApiResponse<UnifiedUser[]>} UserListResponse
 * @returns {import('@tanstack/react-query').DefinedUseQueryResult<import('@/features/members/types/unifiedUser.js').UnifiedUser[], import('@tanstack/react-query').DefaultError>}
 * */

export const useGetInvitees = (projectId) => {
  return useQuery({
    queryKey: ['project-invitations', projectId],
    queryFn: async () => {
      /** @type {UserListResponse} */
      return await api.get(`/invitations/sent/${projectId}`);
    },
    refetchInterval: 2000,
    // projectId가 있을 때만 쿼리 실행 (방어 코드)
    enabled: !!projectId,
    // 초기 데이터가 없을 때 빈 배열 보장 (방어 코드)
    initialData: [],
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      // 날짜 최신순 정렬
      return [...data].sort((a, b) => {
        // 필드명 통일 필요
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      })
    }
  });
}

// [Project.jsx]
// const handleGetProjectInvitationsApi = useCallback((projectId) => {
//   api.get(`invitations/sent/${projectId}`)
//       .then((data) => {
//         setPendingInvites(data);
//       })
//       .catch((error) => {
//         alert(error.message || "초대 목록을 불러오는데 실패했습니다.");
//       })
// }, [])