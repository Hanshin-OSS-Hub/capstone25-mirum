import { useState } from 'react';
import {
  getStatusColor,
  getStatusDotColor,
  getStatusText,
} from '@/features/tasks/utils/task-status.js';
import { useDeleteTask } from '@/features/tasks/api/useDeleteTask.js';
import TaskNote from '@/features/note/components/TaskNote.jsx';
import { IconClose, IconSave, IconTrash } from '@/shared/assets/icons.js';

export default function TaskModalEditor(props) {
  const { editedTask, setEditedTask, teamMembers, onSave, onCancel } = props;
  const { mutate: deleteTask } = useDeleteTask();
  const [newTag, setNewTag] = useState('');

  const inputBase =
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 ' +
    'focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

  const panelCard = 'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm';

  const handleDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.confirm('정말로 이 작업을 삭제하시겠습니까?')) {
      deleteTask(
        { taskId: editedTask.taskId, projectId: editedTask.projectId },
        {
          onSuccess: () => {
            onCancel();
          },
        },
      );
    }
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !(editedTask.tags || []).includes(trimmed)) {
      setEditedTask({ ...editedTask, tags: [...(editedTask.tags || []), trimmed] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setEditedTask({
      ...editedTask,
      tags: (editedTask.tags || []).filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur">
        <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
          <div
            className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${getStatusDotColor(editedTask.status)}`}
          ></div>
          <h2 className="text-lg font-semibold text-gray-900">작업 카드 수정</h2>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSave();
            }}
            className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <IconSave className="mr-2 inline-block" />
            저장
          </button>

          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCancel();
            }}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <IconClose className="mr-2 inline-block" />
            취소
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col space-y-6 lg:col-span-1">
            <div className={panelCard}>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">작업 정보</h3>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-800">담당자</label>
                <select
                  value={editedTask.assignee}
                  onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                  className={inputBase}
                >
                  {teamMembers.map((member) => (
                    <option key={member.username} value={member.username}>
                      {member.nickname} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-800">시작일</label>
                <input
                  type="date"
                  value={editedTask.startDate || ''}
                  onChange={(e) => {
                    const nextStartDate = e.target.value;
                    setEditedTask((prev) => ({
                      ...prev,
                      startDate: nextStartDate,
                      dueDate:
                        prev.dueDate && prev.dueDate >= nextStartDate
                          ? prev.dueDate
                          : nextStartDate,
                    }));
                  }}
                  className={inputBase}
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-800">마감일</label>
                <input
                  type="date"
                  min={editedTask.startDate || ''}
                  value={editedTask.dueDate || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                  className={inputBase}
                />
              </div>

              <div className="mb-2">
                <div className="mb-2 flex items-center justify-between align-middle">
                  <label className="mb-2 block text-sm font-medium text-gray-800">상태</label>
                  <span
                    className={`inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                      editedTask.status,
                    )}`}
                  >
                    {getStatusText(editedTask.status)}
                  </span>
                </div>
                <select
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                  className={inputBase}
                >
                  <option value={'TODO'}>대기</option>
                  <option value={'IN_PROGRESS'}>진행중</option>
                  <option value={'DONE'}>완료</option>
                </select>
              </div>
            </div>

            <div className={panelCard}>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">태그 편집</h3>

              <div className="mb-3 flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(event) => setNewTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="새 태그 입력"
                    className={`${inputBase} py-2 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="add tag"
                  >
                    <i className="ri-add-line text-lg"></i>
                  </button>
                </div>
              </div>

              <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-2">
                {(editedTask.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700 ring-1 ring-blue-100"
                  >
                    <i className="ri-hashtag"></i>
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 cursor-pointer rounded-full p-1 text-blue-600 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              className="mt-auto flex w-full cursor-pointer items-center justify-center rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <IconTrash className="mr-2 text-lg" />
              작업 삭제
            </button>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className={panelCard}>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">작업명</h3>
              <input
                type="text"
                value={editedTask.title || ''}
                onChange={(event) => setEditedTask({ ...editedTask, title: event.target.value })}
                className={inputBase}
                placeholder="작업 제목을 입력하세요"
              />
            </div>

            <div className={panelCard}>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">설명</h3>
              <textarea
                value={editedTask.description || ''}
                onChange={(event) =>
                  setEditedTask({ ...editedTask, description: event.target.value })
                }
                className={`${inputBase} h-28 resize-none`}
              />
            </div>

            <div className={panelCard}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">메모</h3>
              </div>

              <TaskNote
                notes={editedTask.notes || ''}
                onChange={(text) => {
                  setEditedTask({ ...editedTask, notes: text });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
