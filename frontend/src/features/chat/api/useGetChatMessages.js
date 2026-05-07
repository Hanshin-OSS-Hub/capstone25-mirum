import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * @typedef {object} ChatMessage
 * @property {number} id
 * @property {string} author
 * @property {string} message
 * @property {string} timestamp
 * @property {boolean} isAi
 */

/**
 * [READ] 특정 작업의 채팅 메시지 목록 조회
 * @param {number | string} taskId
 * @returns {import('@tanstack/react-query').DefinedUseQueryResult<ChatMessage[], Error>}
 */
export function useGetChatMessages(taskId) {
  return useQuery({
    queryKey: ['chat', taskId],
    queryFn: async () => {
      const response = await api.get(`/tasks/${taskId}/chat`);
      // api.get은 이미 result.data를 반환하므로 바로 리턴합니다.
      return response || [];
    },
    enabled: !!taskId,
  });
}
