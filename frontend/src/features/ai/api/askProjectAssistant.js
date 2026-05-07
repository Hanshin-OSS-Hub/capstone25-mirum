/**
 * Gemini API를 사용하는 프로젝트 AI 어시스턴트
 * @param {string} question
 * @param {Record<string, unknown>} context
 */
export async function askProjectAssistant(question, context) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다.');
  }

  const systemInstruction = [
    '너는 미룸(MIRUM) 프로젝트 관리 비서다.',
    '반드시 제공된 프로젝트 정보만 기반으로 답해라.',
    '정보가 없으면 추측하지 말고 "현재 프로젝트 데이터만으로는 확인할 수 없습니다." 라고 답해라.',
    '답변은 짧고 명확한 한국어로 해라.',
    '가능하면 날짜, 개수, 남은 일수 등을 함께 정리해라.',
    context?.systemPrompt ?? '',
  ]
    .filter(Boolean)
    .join('\n');

  const userMessage = [
    `질문: ${question}`,
    '',
    '현재 프로젝트 데이터(JSON):',
    JSON.stringify(context, null, 2),
  ].join('\n');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    },
  );

  // 429: API 쿼터 초과 — 실제 에러 메시지 로깅 후 처리
  if (response.status === 429) {
    const errBody = await response.json().catch(() => ({}));
    console.error('[MIRUM AI] 429 상세:', JSON.stringify(errBody, null, 2));
    if (import.meta.env.DEV) {
      console.warn('[MIRUM AI] Gemini 쿼터 초과 (429) — 개발 Mock 응답으로 대체합니다.');
      return getMockResponse(question, context);
    }
    throw new Error('AI 서비스 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Gemini API 요청에 실패했습니다.');
  }

  const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!answer) {
    throw new Error('AI 응답이 비어 있습니다.');
  }

  return answer;
}

/**
 * 개발 환경 전용 Mock 응답 생성 (429 폴백)
 * @param {string} question
 * @param {Record<string, unknown>} context
 * @returns {string}
 */
function getMockResponse(question, context) {
  if (context?.type === 'summary') {
    return `## 📝 메모 요약 (개발 Mock)

- 입력된 메모 내용을 분석했습니다.
- 핵심 내용: **${question.slice(0, 80).replace(/\n/g, ' ')}...**
- 주요 항목들이 정리되어 있으며, 추가 검토가 필요한 부분이 있습니다.

> ⚠️ 개발 환경 Mock 응답입니다. (Gemini API 쿼터 초과 — 잠시 후 재시도하세요)`;
  }

  return `안녕하세요! 👋

질문 **"${question}"** 에 대한 답변이에요.

현재 프로젝트 데이터를 바탕으로 보면, 작업들이 전반적으로 안정적으로 진행되고 있는 것 같아요. 막히는 부분이 있으면 언제든지 물어봐 주세요!

> ⚠️ 개발 Mock 응답입니다. (Gemini API 쿼터 초과 — 잠시 후 재시도하세요)`;
}
