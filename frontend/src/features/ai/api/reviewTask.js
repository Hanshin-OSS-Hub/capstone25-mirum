/**
 * @param {Record<string, unknown>} task
 * @returns {Promise<string>}
 */
export async function reviewTask(task) {
  // @ts-ignore Vite runtime env 객체 접근
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
  }

  const systemPrompt = [
    '너는 프로젝트 동료 리뷰어다.',
    '문제점과 개선점을 분석해라.',
    '결과는 bullet point 형태로 작성해라.',
    '너무 길지 않게 작성해라.',
    '마지막에는 반드시 긍정적인 한 줄을 포함해라.',
    '답변은 한국어로 작성해라.',
  ].join('\n');

  const safeTask = {
    title: task?.title || '',
    description: task?.description || '',
    notes: task?.notes || '',
    assignee: task?.assignee || '',
    status: task?.status || '',
    dueDate: task?.dueDate || '',
    tags: task?.tags || [],
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            '다음 Task를 동료 관점에서 리뷰해줘.',
            '반드시 간결한 bullet point로 작성해줘.',
            '',
            'Task 데이터(JSON):',
            JSON.stringify(safeTask, null, 2),
          ].join('\n'),
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'AI 리뷰 요청에 실패했습니다.');
  }

  const result = data?.choices?.[0]?.message?.content?.trim();
  if (!result) {
    throw new Error('AI 리뷰 응답이 비어 있습니다.');
  }

  return result;
}
