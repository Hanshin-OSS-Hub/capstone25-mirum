import { useState } from 'react';
import { askProjectAssistant } from '../api/askProjectAssistant.js';
import { api } from '@/api/client.js';

/**
 * MIRUM 프로젝트 통합 AI 서비스 훅
 * @returns {{
 *   summarizeNotes: (notes: string) => Promise<string>,
 *   askTaskAI: (message: string, projectId: number, taskId?: number) => Promise<string>,
 *   generateProjectReport: (projectId: number) => Promise<string>,
 *   isLoading: boolean,
 *   error: string | null
 * }}
 */
export function useMirumAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 1. 기존 메모 요약 기능
   * @param notes
   */
  const summarizeNotes = async (notes) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.post('/api/ai/summary', { notes });
      return result;
    } catch (err) {
      console.error(err);
      const msg = '메모를 요약하는 중 오류가 발생했습니다.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. 작업 기반 AI 팀원 채팅
   * @param message
   * @param projectId
   * @param taskId
   */
  const askTaskAI = async (message, projectId, taskId) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await askProjectAssistant(message, projectId, taskId);
      return result;
    } catch (err) {
      console.error(err);
      const msg = 'AI 팀원과 대화 중 연결이 원활하지 않습니다.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 3. 프로젝트 전체 데이터 분석 리포트 생성
   * @param projectId
   */
  const generateProjectReport = async (projectId) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.post('/api/ai/report', { projectId });
      return result;
    } catch {
      const msg = '리포트를 생성하는 중 오류가 발생했습니다.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summarizeNotes,
    askTaskAI,
    generateProjectReport,
    isLoading,
    error,
  };
}
