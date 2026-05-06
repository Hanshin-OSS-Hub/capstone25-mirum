import { useState } from 'react';
import { askProjectAssistant } from '../api/askProjectAssistant.js';

/**
 * MIRUM 프로젝트 통합 AI 서비스 훅
 * @returns {{
 *   summarizeNotes: (notes: string) => Promise<string>,
 *   askTaskAI: (message: string, context: any) => Promise<string>,
 *   generateProjectReport: (context: any) => Promise<string>,
 *   isLoading: boolean,
 *   error: string | null
 * }}
 */
export function useMirumAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 1. 기존 메모 요약 기능 (Gemini 활용 기조 유지)
   * @param notes
   */
  const summarizeNotes = async (notes) => {
    setIsLoading(true);
    setError(null);
    try {
      const prompt = `다음 작업 메모를 핵심 위주로 깔끔하게 요약해줘. 마크다운 형식을 사용해.\n\n내용:\n${notes}`;
      const result = await askProjectAssistant(prompt, { type: 'summary' });
      return result;
    } catch {
      const msg = '메모를 요약하는 중 오류가 발생했습니다.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. 작업 기반 AI 팀원 채팅 (구어체 페르소나)
   * @param message
   * @param context
   */
  const askTaskAI = async (message, context) => {
    setIsLoading(true);
    setError(null);
    try {
      const systemPrompt = `너는 MIRUM 프로젝트의 친절한 팀원이다.
      사용자의 질문에 대해 제공된 작업(Task) 컨텍스트를 바탕으로 답해라.
      - 반드시 구어체(~해요, ~인가요?)를 사용해라.
      - 답변은 3~5문장 이내로 짧고 명확하게 해라.
      - 팀원으로서 격려하는 태도를 유지해라.`;

      const result = await askProjectAssistant(message, { ...context, systemPrompt });
      return result;
    } catch {
      const msg = 'AI 팀원과 대화 중 연결이 원활하지 않습니다.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 3. 프로젝트 전체 데이터 분석 리포트 생성 (디자인 확인을 위한 Mocking 버전)
   * @param context
   */
  const generateProjectReport = async (context) => {
    setIsLoading(true);
    setError(null);

    // AI 분석 느낌을 주기 위한 인위적인 지연 시간
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      /* OLD: 실제 API 호출 로직 (보존)
      const prompt = `프로젝트 전체 데이터를 분석하여 상세 리포트를 작성해줘...`;
      const result = await askProjectAssistant(prompt, context);
      return result;
      */

      // NEW: 디자인 확인을 위한 Mock 리포트 데이터
      const mockReport = `# 📊 프로젝트 AI 종합 분석 리포트
      
## 1. 프로젝트 건강도 요약
- **상태:** 🟢 양호 (Healthy)
- **진행률:** 전체 작업 중 **${Math.round((context.summary.completed / context.summary.total) * 100)}%** 완료됨.
- **총평:** 프로젝트가 일정에 맞춰 안정적으로 진행되고 있습니다. 특히 완료된 작업의 품질이 높아 팀의 숙련도가 돋보입니다.

## 2. 작업 진행 현황 분석
- **Todo (대기):** ${context.summary.todo}개
- **In Progress (진행):** ${context.summary.inProgress}개
- **Done (완료):** ${context.summary.completed}개
- **분석:** 현재 진행 중인 작업들이 마감일에 집중되어 있어, 이번 주 내에 리소스 재배치가 필요할 수 있습니다.

## 3. ⚠️ 위험 요소 및 지연 경고
- **마감 임박:** 'API 명세서 작성' 작업의 기한이 내일입니다. 담당자의 확인이 필요합니다.
- **미배정 작업:** 현재 **${context.tasks.filter((t) => !t.assigneeId).length}개**의 작업에 담당자가 없습니다. 조속한 배정이 필요합니다.

## 4. 💡 MIRUM AI의 제언
1. **업무 분산:** 현재 특정 팀원에게 작업이 집중되어 있습니다. 업무를 평준화하여 병목 현상을 방지하세요.
2. **소통 강화:** 'UI 디자인' 작업에 댓글이 0개입니다. 팀원 간의 피드백 교환을 독려해 보세요.
3. **다음 단계:** 이번 주 내로 모든 'Todo' 작업을 배정 완료하는 것을 목표로 삼으세요.

---
*본 리포트는 MIRUM AI가 프로젝트 실시간 데이터를 바탕으로 작성했습니다.*`;

      return mockReport;
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
