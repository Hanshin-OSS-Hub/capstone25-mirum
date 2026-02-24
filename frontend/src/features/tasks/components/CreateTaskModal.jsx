import { useState } from 'react';

export default function CreateTaskModal({ isOpen, onClose, onSubmit, teamMembers }) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignee: teamMembers[0]?.name || '',
    priority: 'medium',
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
      priority: 'medium',
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">새 작업 만들기</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작업 제목 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={taskData.title}
                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                    placeholder="작업 제목을 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <textarea
                    value={taskData.description}
                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                    placeholder="작업에 대한 설명을 입력하세요"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Assignee & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
                  <select
                      value={taskData.assignee}
                      onChange={(e) => setTaskData({ ...taskData, assignee: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">마감일</label>
                  <input
                      type="date"
                      value={taskData.dueDate}
                      onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                <div className="flex space-x-3">
                  {['low', 'medium', 'high'].map((priority) => (
                      <button
                          key={priority}
                          type="button"
                          onClick={() => setTaskData({ ...taskData, priority })}
                          className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors cursor-pointer ${
                              taskData.priority === priority
                                  ? getPriorityColor(priority)
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        {getPriorityText(priority)}
                      </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>

                {/* Add Tag Input */}
                <div className="flex space-x-2 mb-3">
                  <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="태그 입력"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    추가
                  </button>
                </div>

                {/* Tags List */}
                {taskData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {taskData.tags.map((tag) => (
                          <span
                              key={tag}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                      {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    </span>
                      ))}
                    </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
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