/**
 * @param {string} question
 * @param {Record<string, unknown>} context
 */
export async function askProjectAssistant(question, context) {
  // @ts-ignore Vite runtime env 객체 접근
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
  }

  const systemPrompt = [
    '너는 미룸 프로젝트 관리 비서다.',
    '반드시 제공된 프로젝트 정보만 기반으로 답해라.',
    '정보가 없으면 추측하지 말고 "현재 프로젝트 데이터만으로는 확인할 수 없습니다." 라고 답해라.',
    '답변은 짧고 명확한 한국어로 해라.',
    '가능하면 날짜, 개수, 남은 일수 등을 함께 정리해라.',
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            `질문: ${question}`,
            '',
            '현재 프로젝트 데이터(JSON):',
            JSON.stringify(context, null, 2),
          ].join('\n'),
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || '미룸 AI 요청에 실패했습니다.');
  }

  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error('AI 응답이 비어 있습니다.');
  }

  return answer;
}
