import { useEffect, useMemo, useState } from 'react';
// import { taskStatus } from '@/features/tasks/types/task.js';
import { useCreateTask } from '@/features/tasks/api/useCreateTask.js';

export default function CreateTaskModal(props) {
  const { projectId, isOpen, onClose, defaultAssigneeName, members = [], boardId } = props;

  const { mutate: createTask } = useCreateTask();

  const sortedMembers = useMemo(() => {
    const myMember = members.find((m) => m.username === defaultAssigneeName);
    const others = members.filter((m) => m.username !== defaultAssigneeName);
    return myMember ? [myMember, ...others] : others;
  }, [members, defaultAssigneeName]);

  const todayISO = new Date().toISOString().split('T')[0];

  const initialTaskData = {
    title: '',
    description: '',
    status: 'TODO',
    tags: [],
    assignee: '',
    startDate: todayISO,
    dueDate: todayISO,
  };

  const [taskData, setTaskData] = useState(initialTaskData);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTaskData({
        ...initialTaskData,
        assignee: defaultAssigneeName,
      });
      setNewTag('');
    }
  }, [defaultAssigneeName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!taskData.title.trim()) return;

    const selectedMember = sortedMembers.find((m) => m.username === taskData.assignee);

    const normalizedStartDate = taskData.startDate || todayISO;
    const normalizedDueDate =
      taskData.dueDate && taskData.dueDate >= normalizedStartDate
        ? taskData.dueDate
        : normalizedStartDate;

    const requestData = {
      ...taskData,
      title: taskData.title.trim(),
      startDate: normalizedStartDate,
      dueDate: normalizedDueDate,
      projectId: Number(projectId),
      boardId: Number(boardId),
      assigneeId: selectedMember ? selectedMember.id : null,
    };

    createTask(requestData, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    setTaskData(initialTaskData);
    setNewTag('');
    onClose();
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !taskData.tags.includes(trimmed)) {
      setTaskData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTaskData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const inputBase =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 ' +
    'focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-4">
        <div className="flex h-[min(92vh,820px)] w-full max-w-[920px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
          {/* 헤더 */}
          <div className="flex items-start justify-between border-b border-gray-100 px-8 py-5">
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">새 작업 만들기</h2>
              <p className="mt-1 text-sm text-gray-500">
                팀원에게 할 일을 배정하고 진행을 관리하세요.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="close"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* 본문 */}
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-5">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    작업 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskData.title}
                    onChange={(event) => setTaskData({ ...taskData, title: event.target.value })}
                    placeholder="예) 로그인 UI 마무리"
                    className={inputBase}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">설명</label>
                  <textarea
                    value={taskData.description}
                    onChange={(event) =>
                      setTaskData({ ...taskData, description: event.target.value })
                    }
                    placeholder="작업에 대한 설명을 입력하세요"
                    rows={4}
                    className={`${inputBase} min-h-[110px] resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">담당자</label>
                    <select
                      value={taskData.assignee}
                      onChange={(event) =>
                        setTaskData({ ...taskData, assignee: event.target.value })
                      }
                      className={inputBase}
                    >
                      {sortedMembers.map((member) => (
                        <option key={member.username} value={member.username}>
                          {member.nickname} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">상태</label>
                    <select
                      value={taskData.status}
                      onChange={(event) => setTaskData({ ...taskData, status: event.target.value })}
                      className={inputBase}
                    >
                      <option value={'TODO'}>대기</option>
                      <option value={'IN_PROGRESS'}>진행중</option>
                      <option value={'DONE'}>완료</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">시작일</label>
                    <input
                      type="date"
                      value={taskData.startDate}
                      onChange={(event) => {
                        const nextStartDate = event.target.value;
                        setTaskData((prev) => ({
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

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">마감일</label>
                    <input
                      type="date"
                      min={taskData.startDate}
                      value={taskData.dueDate}
                      onChange={(event) =>
                        setTaskData({ ...taskData, dueDate: event.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">태그</label>

                  <div className="flex gap-2">
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
                        placeholder="예) 디자인, UI/UX"
                        className={`${inputBase} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="add tag"
                      >
                        <i className="ri-add-line text-lg"></i>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={addTag}
                      className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-white shadow-sm hover:bg-blue-700"
                    >
                      추가
                    </button>
                  </div>

                  {taskData.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {taskData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700 ring-1 ring-blue-100"
                        >
                          <i className="ri-hashtag text-base"></i>
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 cursor-pointer rounded-full p-1 text-blue-600 hover:bg-blue-100 hover:text-blue-800"
                            aria-label="remove tag"
                          >
                            <i className="ri-close-line text-sm"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-gray-400">
                      태그를 추가하면 필터링/탐색이 쉬워요.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 하단 버튼 고정 */}
            <div className="border-t border-gray-100 bg-white px-8 py-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-white shadow-sm hover:bg-blue-700"
                >
                  생성
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
