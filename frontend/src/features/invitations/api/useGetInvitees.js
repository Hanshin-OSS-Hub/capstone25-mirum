import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/** @typedef {import('@/types/invitation.js').Invitation} Invitation */

/**
 * [READ] 특정 프로젝트에서 보낸 초대 목록 조회 API
 * @param {string|number} projectId
 * @returns {import('@tanstack/react-query').DefinedUseQueryResult<Invitation[], import('@tanstack/react-query').DefaultError>}
 */
export const useGetInvitees = (projectId) => {
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['project-invitations', projectId],
    queryFn: async () => {
      /** @type {Invitation[]} */
      return await api.get(`/invitations/sent/${projectId}`);
    },
    enabled: !!projectId && isTokenAvailable,
    initialData: [],
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
