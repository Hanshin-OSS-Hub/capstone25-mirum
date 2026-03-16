import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 보드의 태스크 목록 조회 API (무한 스크롤)
 * @param {number} boardId - 보드 ID
 * @param {number} size - 페이지당 아이템 개수 (기본값: 20)
 */
export const useGetTaskList = (boardId, size = 20) => {
  return useInfiniteQuery({
    queryKey: ['tasks', boardId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!boardId) return { content: [], last: true };

      // 백엔드 API가 Page<TaskSummaryDTO> 형태를 반환한다고 가정
      // URL: GET /tasks?boardId=1&page=0&size=20
      return await api.get(`/tasks?boardId=${boardId}&page=${pageParam}&size=${size}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // lastPage: 백엔드 응답 (Spring Page 객체 구조 가정)
      // lastPage.last가 false이면 다음 페이지(number + 1) 반환
      if (!lastPage || lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    enabled: !!boardId,
    select: (data) => {
      // 모든 페이지의 content를 하나의 배열로 합침 (Flat)
      return {
        pages: data.pages,
        pageParams: data.pageParams,
        // 편의를 위해 모든 태스크를 플랫하게 제공
        allTasks: data.pages.flatMap((page) => page.content || []),
      };
    },
  });
};
