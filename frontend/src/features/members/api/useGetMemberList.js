import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 프로젝트 멤버 목록 조회 API
 * @param {string | number} projectId
 * @param {string} myUsername
 * @typedef {import('@/features/members/types/unifiedUser.js').UnifiedUser} UnifiedUser
 * @typedef {import('@/api/types/common.js').ApiResponse<UnifiedUser[]>} UserListResponse
 * @returns {import('@tanstack/react-query').DefinedUseQueryResult<import('@/features/members/types/unifiedUser.js').UnifiedUser[], import('@tanstack/react-query').DefaultError> }
 */

export const useGetMemberList = (projectId, myUsername) => {
  return useQuery({
    queryKey: ['members', projectId],
    queryFn: async () => {
      /** @type {UserListResponse} */
      return await api.get(`/member/${projectId}`);
    },
    refetchInterval: 2000,
    // projectId가 있을 때만 쿼리 실행 (방어 코드)
    enabled: !!projectId,
    // 초기 데이터가 없을 때 빈 배열 보장 (방어 코드)
    initialData: [],
    // 서버 데이터를 UI에 맞게 미리 가공
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      // 내 아이디(myUsername)와 일치하면 맨 앞으로(-1)
      return [...data].sort((a, b) => {
        if (a.username === myUsername) return -1;
        if (b.username === myUsername) return 1;
        // 나머지 가나다순 정렬
        return a.nickname.localeCompare(b.nickname);
      });
    }
  })
}