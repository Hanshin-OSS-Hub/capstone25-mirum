import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TaskModal({ task, onClose, onUpdate, teamMembers, currentUserName }) {
  const [editedTask, setEditedTask] = useState({ ...task, notes: task.notes || '' });
  const [isNotesPreview, setIsNotesPreview] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  const chatScrollRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    setEditedTask({ ...task, notes: task.notes || '' });
    setIsNotesPreview(true);
  }, [task]);

  const isAssignee = useMemo(() => {
    return (currentUserName || '') === (task.assignee || '');
  }, [currentUserName, task.assignee]);

  useEffect(() => {
    if (!isAssignee) setIsNotesPreview(true);
  }, [isAssignee]);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: '김민수', message: '이 작업 진행 상황 어떤가요?', timestamp: '2024-01-15 14:30' },
    { id: 2, author: '이지영', message: 'UI 디자인 거의 완료되었습니다. 피드백 부탁드려요!', timestamp: '2024-01-15 14:35' },
    { id: 3, author: '박준호', message: '좋네요! 몇 가지 수정사항이 있는데 노트에 정리해두겠습니다.', timestamp: '2024-01-15 14:40' },
  ]);

  const leaderName = useMemo(() => {
    const leader =
        teamMembers?.find((member) => {
          const role = member?.role || '';
          return role.includes('팀장') || role.includes('방장') || role.toLowerCase().includes('leader');
        }) || teamMembers?.[0];

    return leader?.name || '';
  }, [teamMembers]);

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'in-progress':
        return '진행중';
      default:
        return '대기';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    if (!priority) return '';
    if (priority === 'high') return '높음';
    if (priority === 'medium') return '중간';
    if (priority === 'low') return '낮음';
    return priority;
  };

  const getPriorityPill = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-800';

    const text = getPriorityText(priority);

    if (text === '높음') return 'bg-red-100 text-red-800';
    if (text === '중간') return 'bg-yellow-100 text-yellow-800';
    if (text === '낮음') return 'bg-blue-100 text-blue-800';

    return 'bg-gray-100 text-gray-800';
  };

  const formatDateDot = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${day}.`;
  };

  const handleSave = () => {
    const updated = {
      ...editedTask,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdate(updated);
    onClose();
  };

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
        now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setChatMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        author: currentUserName || '나',
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

  const inputBase =
      'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 ' +
      'focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

  const panelCard = 'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm';

  const TeamView = () => {
    const priorityText = getPriorityText(editedTask.priority);

    return (
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusPill(editedTask.status)}`}>
              {getStatusText(editedTask.status)}
            </span>

              {priorityText && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityPill(editedTask.priority)}`}>
                {priorityText}
              </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                  type="button"
                  className="p-2 rounded-lg text-gray-300 cursor-not-allowed"
                  disabled
                  aria-label="edit-disabled"
                  title="읽기 전용"
              >
                <i className="ri-pencil-line text-lg"></i>
              </button>

              {/* ✅ 팀원 화면에도 나가기 버튼 추가 */}
              <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                나가기
              </button>

              <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  aria-label="close"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editedTask.title}</h2>

            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">담당자</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                      {(editedTask.assignee || '?').slice(0, 1)}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{editedTask.assignee || '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">마감일</p>
                  <p className="text-sm font-medium text-gray-900">
                    {editedTask.dueDate ? formatDateDot(editedTask.dueDate) : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">상태</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusDotColor(editedTask.status)}`}></span>
                    <p className="text-sm font-medium text-gray-900">{getStatusText(editedTask.status)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-800 mb-3">태그</p>
              <div className="flex flex-wrap gap-2">
                {editedTask.tags?.map((tag, idx) => (
                    <span
                        key={idx}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100"
                    >
                  {tag}
                </span>
                ))}
                {(!editedTask.tags || editedTask.tags.length === 0) && (
                    <span className="text-sm text-gray-400">태그가 없습니다</span>
                )}
              </div>
            </div>

            <div className="my-8 border-t border-gray-100"></div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">메모</h3>

              <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium cursor-default"
              >
                미리보기
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 min-h-[360px]">
              {editedTask.notes ? (
                  <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-gray-900">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-gray-900">{children}</h3>,
                        p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 text-gray-700">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 text-gray-700">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                        pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">{children}</pre>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">{children}</blockquote>,
                      }}
                  >
                    {editedTask.notes}
                  </ReactMarkdown>
              ) : (
                  <p className="text-gray-400 italic">메모가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
    );
  };

  return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

        <div className="relative h-full w-full flex items-center justify-center p-4">
          <div className="w-full max-w-7xl h-[92vh] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden flex">
            {!isAssignee ? (
                <TeamView />
            ) : (
                <div className="flex-1 bg-white overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(editedTask.status)}`}></div>
                      <h2 className="text-xl font-semibold text-gray-900 truncate">{editedTask.title}</h2>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusPill(editedTask.status)}`}>
                    {getStatusText(editedTask.status)}
                  </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                          onClick={handleSave}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                      >
                        <i className="ri-save-line mr-2"></i>
                        저장
                      </button>

                      <button
                          onClick={onClose}
                          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <i className="ri-door-open-line mr-2"></i>
                        나가기
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1 space-y-6">
                        <div className={panelCard}>
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">작업 정보</h3>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-800 mb-2">담당자</label>
                            <select
                                value={editedTask.assignee}
                                onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                                className={inputBase}
                            >
                              {teamMembers.map((member) => (
                                  <option key={member.id} value={member.name}>
                                    {member.name} ({member.role})
                                  </option>
                              ))}
                            </select>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-800 mb-2">마감일</label>
                            <input
                                type="date"
                                value={editedTask.dueDate}
                                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                                className={inputBase}
                            />
                          </div>

                          <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-800 mb-2">상태</label>
                            <select
                                value={editedTask.status}
                                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                                className={inputBase}
                            >
                              <option value="todo">대기</option>
                              <option value="in-progress">진행중</option>
                              <option value="completed">완료</option>
                            </select>
                          </div>
                        </div>

                        <div className={panelCard}>
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">태그</h3>
                          <div className="flex flex-wrap gap-2">
                            {editedTask.tags?.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm ring-1 ring-blue-100"
                                >
                            <i className="ri-hashtag"></i>
                                  {tag}
                          </span>
                            ))}
                            {(!editedTask.tags || editedTask.tags.length === 0) && (
                                <span className="text-gray-500 text-sm">태그가 없습니다</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 space-y-6">
                        <div className={panelCard}>
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">설명</h3>
                          <textarea
                              value={editedTask.description}
                              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                              className={`${inputBase} h-28 resize-none`}
                          />
                        </div>

                        <div className={panelCard}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">메모</h3>

                            <div className="inline-flex rounded-xl bg-gray-100 p-1">
                              <button
                                  type="button"
                                  onClick={() => setIsNotesPreview(true)}
                                  className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                                      isNotesPreview ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                  }`}
                              >
                                미리보기
                              </button>
                              <button
                                  type="button"
                                  onClick={() => setIsNotesPreview(false)}
                                  className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                                      !isNotesPreview ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                  }`}
                              >
                                편집
                              </button>
                            </div>
                          </div>

                          {isNotesPreview ? (
                              <div className="min-h-[320px] p-5 rounded-2xl border border-gray-200 bg-white prose prose-sm max-w-none">
                                {editedTask.notes ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {editedTask.notes}
                                    </ReactMarkdown>
                                ) : (
                                    <p className="text-gray-500 italic">메모가 없습니다. 편집 모드에서 작성해보세요.</p>
                                )}
                              </div>
                          ) : (
                              <div className="relative">
                          <textarea
                              value={editedTask.notes}
                              onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                              className="w-full h-80 p-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-mono text-sm"
                          />
                                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                  마크다운 지원
                                </div>
                              </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* 오른쪽 채팅 패널 */}
            <div className="w-80 border-l border-gray-100 flex flex-col bg-white">
              <div className="px-4 py-4 border-b border-gray-100 bg-white">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <i className="ri-chat-3-line mr-2"></i>
                  채팅
                </h3>
                <p className="text-sm text-gray-500 mt-1">팀원들과 메시지를 주고받아요</p>
              </div>

              <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50"
              >
                {chatMessages.map((message) => {
                  const isMe = message.author === (currentUserName || '나');
                  const isLeader = message.author === leaderName;

                  return (
                      <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ring-1 ring-black/5 ${
                                isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
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

                {/* ✅ 자동 스크롤 도착 지점 */}
                <div ref={chatBottomRef}></div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2 items-center">
                  <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleChatKeyDown}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
                  />
                  <button
                      onClick={sendMessage}
                      className="px-3 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                      aria-label="send"
                  >
                    <i className="ri-send-plane-line"></i>
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 mt-2">
                  Enter 키로 바로 전송됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}