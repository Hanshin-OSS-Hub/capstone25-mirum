import { useState } from 'react';

export default function CreateTaskModal({ isOpen, onClose, onSubmit, teamMembers }) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignee: teamMembers[0]?.name || '',
    dueDate: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskData.title.trim()) {
      onSubmit(taskData);
      handleClose();
    }
  };

  const handleClose = () => {
    setTaskData({
      title: '',
      description: '',
      assignee: teamMembers[0]?.name || '',
      dueDate: '',
      tags: []
    });
    setNewTag('');
    onClose();
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !taskData.tags.includes(trimmed)) {
      setTaskData({ ...taskData, tags: [...taskData.tags, trimmed] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTaskData({
      ...taskData,
      tags: taskData.tags.filter((tag) => tag !== tagToRemove)
    });
  };

  const inputBase =
      "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 " +
      "focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

  return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
        ></div>

        {/* Centered Modal */}
        <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">새 작업 만들기</h2>
                <p className="text-sm text-gray-500 mt-1">
                  팀원에게 할 일을 배정하고 진행을 관리하세요.
                </p>
              </div>
              <button
                  onClick={handleClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                  aria-label="close"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  작업 제목 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={taskData.title}
                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                    placeholder="예) 로그인 UI 마무리"
                    className={inputBase}
                    required
                />
                <p className="text-xs text-gray-400 mt-2">
                  짧고 명확하게 쓰면 팀원이 더 빨리 이해해요.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">설명</label>
                <textarea
                    value={taskData.description}
                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                    placeholder="작업에 대한 설명을 입력하세요"
                    rows={3}
                    className={`${inputBase} resize-none`}
                />
              </div>

              {/* Assignee & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">담당자</label>
                  <select
                      value={taskData.assignee}
                      onChange={(e) => setTaskData({ ...taskData, assignee: e.target.value })}
                      className={inputBase}
                  >
                    {teamMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name} ({member.role})
                        </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">마감일</label>
                  <input
                      type="date"
                      value={taskData.dueDate}
                      onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                      className={inputBase}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">태그</label>

                {/* Add Tag Input */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="예) 디자인, UI/UX"
                        className={`${inputBase} pr-10`}
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                        aria-label="add tag"
                    >
                      <i className="ri-add-line text-lg"></i>
                    </button>
                  </div>

                  <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                  >
                    추가
                  </button>
                </div>

                {/* Tags List */}
                {taskData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {taskData.tags.map((tag) => (
                          <span
                              key={tag}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                          >
                      <i className="ri-hashtag text-base"></i>
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 p-1 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 cursor-pointer"
                                aria-label="remove tag"
                            >
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    </span>
                      ))}
                    </div>
                )}

                {taskData.tags.length === 0 && (
                    <p className="text-xs text-gray-400 mt-3">
                      태그를 추가하면 필터링/탐색이 쉬워져요.
                    </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-5 border-t border-gray-100">
                <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}