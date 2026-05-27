import { api } from '@/api/client.js';

/**
 * 백엔드를 경유하는 프로젝트 AI 어시스턴트
 * @param {string} question
 * @param {number} projectId
 * @param {number} [taskId]
 */
export async function askProjectAssistant(question, projectId, taskId) {
  try {
    const result = await api.post('/api/ai/assistant', {
      question,
      projectId,
      taskId,
    });
    return result;
  } catch (error) {
    console.error('[MIRUM AI] 어시스턴트 요청 실패:', error);
    throw error;
  }
}
