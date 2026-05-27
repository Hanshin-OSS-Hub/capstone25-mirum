import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/** @typedef {import('@/types/member.js').ProjectMemberDTO} ProjectMemberDTO */

/**
 * [READ] 프로젝트 멤버 목록 조회 API
 * @param {string | number} projectId
 * @param {string} myUsername
 * @returns {import('@tanstack/react-query').DefinedUseQueryResult<ProjectMemberDTO[], import('@tanstack/react-query').DefaultError> }
 */
export const useGetMemberList = (projectId, myUsername) => {
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['members', projectId],
    queryFn: async () => {
      /** @type {ProjectMemberDTO[]} */
      return await api.get(`/api/member/${projectId}`);
    },
    enabled: !!projectId && isTokenAvailable,
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      // 내 아이디(myUsername)와 일치하면 맨 앞으로(-1), 나머지는 닉네임 가나다순 정렬
      return [...data].sort((a, b) => {
        if (a.username === myUsername) return -1;
        if (b.username === myUsername) return 1;
        // 나머지 가나다순 정렬
        return a.nickname.localeCompare(b.nickname);
      });
    },
  });
};
