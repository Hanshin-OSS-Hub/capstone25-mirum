import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
 * [READ & SUBSCRIBE] 특정 작업의 채팅 메시지 목록 조회 및 SSE 실시간 수신
 * @param {number | string} taskId
 * @returns {import('@tanstack/react-query').DefinedUseQueryResult<ChatMessage[], Error>}
 */
export function useGetChatMessages(taskId) {
  const queryClient = useQueryClient();
  const queryKey = ['chat', taskId];

  // 1. Initial Fetch
  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get(`/api/tasks/${taskId}/chat`);
      return response || [];
    },
    enabled: !!taskId,
  });

  // 2. SSE Subscription
  useEffect(() => {
    if (!taskId) return;

    let eventSource;
    let reconnectTimeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connectSSE = () => {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      // Ensure url doesn't have double slashes if baseUrl ends with /
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const url = `${cleanBaseUrl}/api/tasks/${taskId}/chat/subscribe${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      
      console.log('Attempting SSE connection to:', url.split('?')[0]); // Log without token for security
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const newMessage = JSON.parse(event.data);
          console.log('SSE Message received:', newMessage);
          
          // Update the React Query cache directly with the new message
          queryClient.setQueryData(queryKey, (oldData) => {
            if (!oldData) return [newMessage];
            // Check if message already exists to prevent duplicates
            const exists = oldData.find(msg => msg.id === newMessage.id);
            if (exists) return oldData;
            return [...oldData, newMessage];
          });
        } catch (error) {
          console.error('SSE Message parsing error:', error, event.data);
        }
      };

      eventSource.addEventListener('init', (event) => {
          console.log('SSE Connected successfully:', event.data);
          reconnectAttempts = 0; // Reset attempts on successful connection
      });

      eventSource.onerror = (error) => {
        console.error('SSE Connection Error. State:', eventSource.readyState, error);
        eventSource.close();

        if (reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.min(10000, 1000 * Math.pow(2, reconnectAttempts));
          reconnectAttempts++;
          console.log(`SSE 재연결 시도 중... (${reconnectAttempts}/${maxReconnectAttempts}) ${timeout}ms 후 시도`);
          reconnectTimeout = setTimeout(connectSSE, timeout);
        } else {
          console.error('SSE 최대 재연결 시도 횟수 초과');
        }
      };
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [taskId, queryClient]);

  return queryResult;
}
