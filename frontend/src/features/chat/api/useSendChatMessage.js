import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * @typedef {object} SendChatMessageDTO
 * @property {string} author
 * @property {string} message
 * @property {boolean} [isAi]
 */

/**
 * [CREATE] 채팅 메시지 전송 요청
 * @param {number | string} taskId
 * @returns {import('@tanstack/react-query').UseMutationResult<any, Error, SendChatMessageDTO>}
 */
export function useSendChatMessage(taskId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(`/tasks/${taskId}/chat`, payload);
      return response;
    },
    onSuccess: () => {
      // 메시지 전송 성공 시 해당 작업의 채팅 캐시 무효화 -> 목록 자동 갱신
      queryClient.invalidateQueries({ queryKey: ['chat', taskId] });
    },
  });
}
