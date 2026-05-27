import { api } from '@/api/client.js';

/**
 * 백엔드를 경유하는 작업 리뷰 AI
 * @param {number} projectId
 * @param {number} taskId
 * @returns {Promise<string>}
 */
export async function reviewTask(projectId, taskId) {
  try {
    const result = await api.post('/api/ai/review', {
      projectId,
      taskId,
    });
    return result;
  } catch (error) {
    console.error('[MIRUM AI] 리뷰 요청 실패:', error);
    throw error;
  }
}
