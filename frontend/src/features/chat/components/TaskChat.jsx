import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useGetChatMessages } from '@/features/chat/api/useGetChatMessages.js';
import { useSendChatMessage } from '@/features/chat/api/useSendChatMessage.js';
import { useMirumAI } from '@/features/ai/hooks/useMirumAI.js';
import { IconCollapse, IconCrown, IconRobot, IconSend } from '@/shared/assets/icons.js';
import { LoadingSpinner, UserProfileImg } from '@/shared/components/index.js';

/**
 * 작업 카드 내 통합 채팅 패널 컴포넌트 (TanStack Query + MSW 연동)
 * @param {object} props
 * @param {string | number} props.taskId - 현재 작업 ID
 * @param {Function} props.onChatClose - 패널 닫기 콜백
 * @param {string} props.currentUser - 현재 사용자 이름
 * @param {string} props.leaderName - 프로젝트 리더 이름
 * @param {object} props.taskContext - AI에게 전달할 작업 컨텍스트
 */
export default function TaskChat({ taskId, onChatClose, currentUser, leaderName, taskContext }) {
  const [newMessage, setNewMessage] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const chatBottomRef = useRef(null);

  // 1. API 훅 및 AI 훅 사용
  const { data: chatMessages = [], isLoading: isChatLoading } = useGetChatMessages(taskId);
  const { mutate: sendMessage } = useSendChatMessage(taskId);
  const { askTaskAI, isLoading: isAiGenerating } = useMirumAI();

  const scrollChatToBottom = (behavior = 'smooth') => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    scrollChatToBottom('auto');
  }, [isChatLoading]);

  useEffect(() => {
    scrollChatToBottom('smooth');
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || isAiGenerating) return;

    // 사용자 메시지 서버에 저장
    sendMessage({
      author: currentUser || '나',
      message: trimmed,
      isAi: false,
    });
    setNewMessage('');

    // AI 모드일 경우 AI 답변 생성 및 서버 저장
    if (isAiMode) {
      try {
        const aiResponse = await askTaskAI(trimmed, taskContext);
        sendMessage({
          author: 'MIRUM AI',
          message: aiResponse,
          isAi: true,
        });
      } catch (err) {
        console.error('AI 답변 생성 실패:', err);
      }
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getDateKey = (timestamp) => {
    if (!timestamp) return '';
    const parsedDate = new Date(timestamp);
    if (Number.isNaN(parsedDate.getTime())) return String(timestamp).slice(0, 10);

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const date = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const formatDateDivider = (timestamp) => {
    if (!timestamp) return '';
    const parsedDate = new Date(timestamp);
    if (Number.isNaN(parsedDate.getTime())) return String(timestamp).slice(0, 10);

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const targetKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(parsedDate.getDate()).padStart(2, '0')}`;

    if (targetKey === todayKey) return '오늘';
    if (targetKey === yesterdayKey) return '어제';

    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth() + 1;
    const date = parsedDate.getDate();
    return `${year}. ${month}. ${date}`;
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const parsedDate = new Date(timestamp);
    if (Number.isNaN(parsedDate.getTime())) return String(timestamp).slice(11, 16);

    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex w-[440px] flex-col border-l border-gray-100 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-5 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-gray-900">팀 & AI 소통</h3>
            {isAiMode && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700 ring-1 ring-blue-200">
                AI Active
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onChatClose}
            className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <IconCollapse size={20} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto bg-gray-50 px-5 py-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isChatLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner size="sm" label="대화 이력을 불러오는 중..." />
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">대화가 없습니다.</p>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const isMe = msg.author === (currentUser || '나');
            const isAI = msg.isAi;
            const isLeader = msg.author === leaderName;
            const previousMessage = chatMessages[index - 1];
            const nextMessage = chatMessages[index + 1];
            const isFirstMessageOfDate =
              index === 0 || getDateKey(previousMessage?.timestamp) !== getDateKey(msg.timestamp);
            const isSameAuthorAsPrevious =
              !!previousMessage &&
              previousMessage.author === msg.author &&
              previousMessage.isAi === msg.isAi;
            const isSameAuthorAsNext =
              !!nextMessage && nextMessage.author === msg.author && nextMessage.isAi === msg.isAi;

            return (
              <div key={msg.id}>
                {isFirstMessageOfDate && (
                  <div className="mb-4 mt-1 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold text-gray-500">
                      {formatDateDivider(msg.timestamp)}
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                )}
                <div
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${
                    isSameAuthorAsPrevious ? 'mt-[-6px]' : ''
                  }`}
                >
                  {!isSameAuthorAsPrevious && (
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <UserProfileImg
                        name={msg.author}
                        size="sm"
                        radius="soft"
                        variant="compact"
                        className={isAI ? 'border-blue-200 bg-blue-50 text-blue-600' : ''}
                      />
                      {isAI && <IconRobot size={12} className="text-blue-500" />}
                      <span className="text-sm font-extrabold uppercase tracking-tight text-gray-700">
                        {msg.author}
                      </span>
                      {isLeader && <IconCrown size={12} className="text-amber-500" />}
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] px-4 py-3 shadow-sm ring-1 ${
                      isMe
                        ? `bg-blue-600 text-white ring-blue-700/20 ${
                            isSameAuthorAsPrevious
                              ? 'rounded-bl-2xl rounded-br-2xl rounded-tl-2xl rounded-tr-md'
                              : 'rounded-bl-2xl rounded-br-2xl rounded-tl-2xl rounded-tr-none'
                          } ${isSameAuthorAsNext ? 'rounded-br-md' : ''}`
                        : isAI
                          ? `border-l-4 border-blue-500 bg-white text-gray-900 ring-gray-200 ${
                              isSameAuthorAsPrevious
                                ? 'rounded-bl-2xl rounded-br-2xl rounded-tl-md rounded-tr-2xl'
                                : 'rounded-bl-2xl rounded-br-2xl rounded-tl-none rounded-tr-2xl'
                            } ${isSameAuthorAsNext ? 'rounded-bl-md' : ''}`
                          : `border border-gray-200 bg-white text-gray-900 ring-gray-200 ${
                              isSameAuthorAsPrevious
                                ? 'rounded-bl-2xl rounded-br-2xl rounded-tl-md rounded-tr-2xl'
                                : 'rounded-bl-2xl rounded-br-2xl rounded-tl-none rounded-tr-2xl'
                            } ${isSameAuthorAsNext ? 'rounded-bl-md' : ''}`
                    }`}
                  >
                    <div
                      className={`prose prose-sm max-w-none text-sm font-medium leading-relaxed ${isMe ? 'prose-invert text-white' : 'text-gray-900'}`}
                    >
                      <ReactMarkdown>{msg.message}</ReactMarkdown>
                    </div>
                  </div>
                  <span
                    className={`whitespace-nowrap px-1 text-[10px] font-bold tracking-tight text-gray-400 ${
                      isSameAuthorAsPrevious ? 'mt-1' : 'mt-1.5'
                    }`}
                  >
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {isAiGenerating && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
            <IconRobot size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
              AI is thinking...
            </span>
          </div>
        )}
        <div ref={chatBottomRef}></div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {/* AI Toggle Button */}
            <button
              onClick={() => setIsAiMode(!isAiMode)}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                isAiMode
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 ring-4 ring-blue-50'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={isAiMode ? '일반 모드로 전환' : 'AI에게 질문하기'}
            >
              <IconRobot size={22} />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder={isAiMode ? 'AI 팀원에게 물어보세요...' : '팀원들에게 의견 남기기...'}
                className={`w-full rounded-2xl border px-5 py-3 text-sm font-bold outline-none focus:ring-4 ${
                  isAiMode
                    ? 'bg-blue-50/30 focus:bg-white focus:ring-blue-50'
                    : 'bg-gray-50 focus:bg-white focus:ring-blue-50'
                }`}
                disabled={isAiGenerating}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isAiGenerating}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-xl ${
                !newMessage.trim() || isAiGenerating
                  ? 'cursor-not-allowed bg-gray-200 shadow-none'
                  : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'
              }`}
            >
              <IconSend size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
              {isAiMode ? 'AI Feedback Mode' : 'Press Enter to send'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
