import { HttpResponse, http } from 'msw';
import { tasksDB } from '../model/taskDataModel.js';

// 임시 인메모리 채팅 데이터베이스
const chatDatabase = {};

// 데모를 위해 '웹 개발 프로젝트'(ID: 1)의 모든 태스크에 기본 대화 삽입
tasksDB.forEach((task) => {
  if (Number(task.projectId) === 1) {
    chatDatabase[task.taskId] = [
      {
        id: 101,
        author: '김민수',
        message: '현재까지 작성된 기획서의 핵심 요약과, 다음으로 필요한 태스크를 추천해줄래?',
        timestamp: '2026-05-05T14:30:00+09:00',
        isAi: false,
      },
      {
        id: 102,
        author: 'MIRUM AI',
        message: `현재 **${task.title}** 작업과 관련된 기획 내용을 분석한 결과입니다.\n\n### 📝 기획 핵심 요약\n1. **사용자 경험(UX) 최적화**: 복잡한 태스크 관리를 직관적인 카드 형태로 제공.\n2. **AI 어시스턴트 통합**: 업무 분석 및 리포트 자동 생성.\n\n### 🚀 추천 태스크\n- **API 명세서 상세 설계**: 프론트엔드와 백엔드 간의 데이터 교환 규격 정의가 시급합니다.\n- **컴포넌트 라이브러리 구축**: UI 일관성을 위한 버튼, 입력창 등 공통 컴포넌트 개발.`,
        timestamp: '2026-05-05T14:32:00+09:00',
        isAi: true,
      },
      {
        id: 103,
        author: '김민수',
        message: '좋아, 추천해준 작업을 참고해서 진행해볼게.',
        timestamp: '2026-05-06T09:12:00+09:00',
        isAi: false,
      },
      {
        id: 104,
        author: 'MIRUM AI',
        message: '좋은 선택입니다! 진행 중 도움이 필요하면 언제든 불러주세요. 화이팅! 🚀',
        timestamp: '2026-05-06T09:13:00+09:00',
        isAi: true,
      },
    ];
  }
});

/**
 * 채팅 관련 MSW 핸들러
 */
export const chatHandlers = [
  // 1. 특정 작업의 채팅 목록 조회
  http.get('/api/tasks/:taskId/chat', ({ params }) => {
    const { taskId } = params;
    const messages = chatDatabase[taskId] || [];
    return HttpResponse.json({
      success: true,
      data: messages,
    });
  }),

  // 2. 채팅 메시지 전송
  http.post('/api/tasks/:taskId/chat', async ({ params, request }) => {
    const { taskId } = params;
    const body = await request.json();
    const { author, message, isAi } = body;

    const newMessage = {
      id: Date.now(),
      author,
      message,
      timestamp: new Date().toLocaleString(),
      isAi: !!isAi,
    };

    if (!chatDatabase[taskId]) {
      chatDatabase[taskId] = [];
    }
    chatDatabase[taskId].push(newMessage);

    return HttpResponse.json({
      success: true,
      data: newMessage,
    });
  }),
];
