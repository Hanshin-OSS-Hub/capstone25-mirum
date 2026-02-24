import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TaskModal({ task, onClose, onUpdate, teamMembers }) {
  const [editedTask, setEditedTask] = useState({ ...task, notes: task.notes || '' });
  const [isNotesPreview, setIsNotesPreview] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: '김민수', message: '이 작업 진행 상황 어떤가요?', timestamp: '2024-01-15 14:30' },
    { id: 2, author: '이지영', message: 'UI 디자인 거의 완료되었습니다. 피드백 부탁드려요!', timestamp: '2024-01-15 14:35' },
    { id: 3, author: '박준호', message: '좋네요! 몇 가지 수정사항이 있는데 노트에 정리해두겠습니다.', timestamp: '2024-01-15 14:40' },
  ]);

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in-progress': return '진행중';
      default: return '대기';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSave = () => {
    const updated = {
      ...editedTask,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdate(updated);
  };

  const sendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setChatMessages([
      ...chatMessages,
      { id: chatMessages.length + 1, author: '나', message: trimmed, timestamp }
    ]);
    setNewMessage('');
  };

  return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative w-full h-full flex">
          {/* Main Modal */}
          <div className="flex-1 bg-white shadow-xl overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${editedTask.status === 'completed' ? 'bg-green-500' : editedTask.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                  <h2 className="text-2xl font-semibold text-gray-900">{editedTask.title}</h2>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <i className="ri-save-line mr-2"></i>
                    저장
                  </button>
                  <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Task Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">작업 정보</h3>

                      {/* Assignee */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
                        <select
                            value={editedTask.assignee}
                            onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {teamMembers.map((member) => (
                              <option key={member.id} value={member.name}>
                                {member.name} ({member.role})
                              </option>
                          ))}
                        </select>
                      </div>

                      {/* Due Date */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">마감일</label>
                        <input
                            type="date"
                            value={editedTask.dueDate}
                            onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Status */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                        <select
                            value={editedTask.status}
                            onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="todo">대기</option>
                          <option value="in-progress">진행중</option>
                          <option value="completed">완료</option>
                        </select>
                        <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(editedTask.status)}`}>
                          {getStatusText(editedTask.status)}
                        </span>
                        </div>
                      </div>

                      {/* Priority */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                        <select
                            value={editedTask.priority}
                            onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">낮음</option>
                          <option value="medium">보통</option>
                          <option value="high">높음</option>
                        </select>
                        <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(editedTask.priority)}`}>
                          {getPriorityText(editedTask.priority)}
                        </span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-2">
                        <div>생성일: {formatDate(editedTask.createdAt)}</div>
                        <div>업데이트: {formatDate(editedTask.updatedAt)}</div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">태그</h3>
                      <div className="flex flex-wrap gap-2">
                        {editedTask.tags?.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tag}
                        </span>
                        ))}
                        {(!editedTask.tags || editedTask.tags.length === 0) && (
                            <span className="text-gray-500 text-sm">태그가 없습니다</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">설명</h3>
                      <textarea
                          value={editedTask.description}
                          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Notes */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">메모</h3>
                        <div className="flex items-center space-x-2">
                          <button
                              type="button"
                              onClick={() => setIsNotesPreview(true)}
                              className={`px-3 py-1 rounded-lg text-sm cursor-pointer ${isNotesPreview ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
                          >
                            미리보기
                          </button>
                          <button
                              type="button"
                              onClick={() => setIsNotesPreview(false)}
                              className={`px-3 py-1 rounded-lg text-sm cursor-pointer ${!isNotesPreview ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
                          >
                            편집
                          </button>
                        </div>
                      </div>

                      {isNotesPreview ? (
                          <div className="min-h-[300px] p-4 border border-gray-200 rounded-lg bg-white prose prose-sm max-w-none">
                            {editedTask.notes ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
                                      h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-gray-900">{children}</h2>,
                                      h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-gray-900">{children}</h3>,
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
                                <p className="text-gray-500 italic">메모가 없습니다. 편집 모드에서 메모를 작성해보세요.</p>
                            )}
                          </div>
                      ) : (
                          <div className="relative">
                        <textarea
                            value={editedTask.notes}
                            onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                            placeholder={`마크다운 문법을 사용하여 메모를 작성하세요...

예시:
# 제목
## 부제목
- 목록 항목
- [ ] 체크박스
**굵은 글씨** *기울임*
\`코드\`

> 인용문

\`\`\`
코드 블록
\`\`\``}
                            className="w-full h-80 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                        />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">마크다운 지원</div>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat */}
          <div className="w-80 border-l border-gray-200 flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <i className="ri-chat-3-line mr-2"></i>
                채팅
              </h3>
              <p className="text-sm text-gray-500">팀원들과 실시간으로 소통하세요</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                  <div key={message.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{message.author}</span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{message.message}</p>
                  </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <i className="ri-send-plane-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}