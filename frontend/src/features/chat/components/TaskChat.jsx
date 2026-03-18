import { useEffect, useRef, useState } from 'react';
import { IconCollapse } from '@/shared/assets/icons.js';

/**
 * 작업 카드 내 채팅 패널 컴포넌트
 * @param {Object} props
 * @param {string} props.currentUser - 현재 로그인한 사용자 이름
 * @param {string} props.leaderName - 리더 이름 (뱃지 표시용)
 */
export default function TaskChat({ onChatClose, currentUser, leaderName }) {
  const [newMessage, setNewMessage] = useState('');
  const chatScrollRef = useRef(null);
  const chatBottomRef = useRef(null);

  // 임시 메시지 데이터 (나중에 API 연동 시 제거)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      author: '김민수',
      message: '이 작업 진행 상황 어떤가요?',
      timestamp: '2024-01-15 14:30',
    },
    {
      id: 2,
      author: '이지영',
      message: 'UI 디자인 거의 완료되었습니다. 피드백 부탁드려요!',
      timestamp: '2024-01-15 14:35',
    },
    {
      id: 3,
      author: '박준호',
      message: '좋네요! 몇 가지 수정사항이 있는데 노트에 정리해두겠습니다.',
      timestamp: '2024-01-15 14:40',
    },
  ]);

  const scrollChatToBottom = (behavior = 'smooth') => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior, block: 'end' });
      return;
    }
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollChatToBottom('auto');
  }, []);

  useEffect(() => {
    scrollChatToBottom('smooth');
  }, [chatMessages]);

  const sendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(
      2,
      '0',
    )} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setChatMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        author: currentUser || '나',
        message: trimmed,
        timestamp,
      },
    ]);

    setNewMessage('');
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex w-80 flex-col border-l border-gray-100 bg-white">
      <div className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">채팅</h3>
          <button
            type="button"
            onClick={onChatClose}
            className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            aria-label="close"
          >
            <IconCollapse className="text-lg" />
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">팀원들과 메시지를 주고받아요</p>
      </div>

      <div ref={chatScrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
        {chatMessages.map((message) => {
          const isMe = message.author === (currentUser || '나');
          const isLeader = message.author === leaderName;

          return (
            <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ring-1 ring-black/5 ${
                  isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-medium ${isMe ? 'text-blue-100' : 'text-gray-500'}`}
                    >
                      {message.author}
                    </span>

                    {isLeader && (
                      <span
                        className={`inline-flex items-center justify-center ${
                          isMe ? 'text-yellow-200' : 'text-yellow-500'
                        }`}
                        title="팀장"
                      >
                        <i className="ri-vip-crown-fill text-xs"></i>
                      </span>
                    )}
                  </div>

                  <span className={`text-[11px] ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp}
                  </span>
                </div>

                <p className={`text-sm ${isMe ? 'text-white' : 'text-gray-700'}`}>
                  {message.message}
                </p>
              </div>
            </div>
          );
        })}

        {/* 자동 스크롤 도착 지점 */}
        <div ref={chatBottomRef}></div>
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleChatKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            onClick={sendMessage}
            className="cursor-pointer rounded-xl bg-blue-600 px-3 py-2.5 text-white shadow-sm hover:bg-blue-700"
            aria-label="send"
          >
            <i className="ri-send-plane-line"></i>
          </button>
        </div>

        <p className="mt-2 text-[11px] text-gray-400">Enter 키로 바로 전송됩니다.</p>
      </div>
    </div>
  );
}
