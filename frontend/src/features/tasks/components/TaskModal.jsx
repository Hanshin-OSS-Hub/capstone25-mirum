import { useEffect, useMemo, useState } from 'react';
import { taskStatus } from '@/features/tasks/types/task.js';
import { useUpdateTask } from '@/features/tasks/api/useUpdateTask.js';
import TaskChat from '@/features/chat/components/TaskChat.jsx';
import TaskNote from '@/features/note/components/TaskNote.jsx';
import TaskModalEditor from '@/features/tasks/components/TaskModalEditor.jsx';
import { IconChat, IconClose, IconEdit } from '@/shared/assets/icons.js';

export default function TaskModal(props) {
  const { task, onClose, members, myUserName } = props;
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task, notes: task.notes || '' });

  const { mutate: updateTask } = useUpdateTask();

  useEffect(() => {
    setEditedTask({ ...task, notes: task.notes || '' });
    setIsEditMode(false); // 태스크가 바뀔 때마다 기본 뷰로 초기화
  }, [task]);

  useEffect(() => {
    if (task) {
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.documentElement.style.overflow = 'auto';
    };
  }, [task]);

  const isAssignee = useMemo(() => {
    return (myUserName || '') === (task.assignee || '');
  }, [myUserName, task.assignee]);

  const leaderName = useMemo(() => {
    const leader =
      members?.find((member) => {
        const role = member?.role || '';
        return (
          role.includes('팀장') || role.includes('방장') || role.toLowerCase().includes('leader')
        );
      }) || members?.[0];

    return leader?.name || '';
  }, [members]);

  const getStatusText = (status) => {
    switch (status) {
      case taskStatus.done:
        return '완료';
      case taskStatus.inProgress:
        return '진행중';
      default:
        return '대기';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case taskStatus.done:
        return 'bg-green-500';
      case taskStatus.inProgress:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case taskStatus.done:
        return 'bg-green-100 text-green-800';
      case taskStatus.inProgress:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    updateTask(
      {
        ...editedTask,
        updateDate: new Date().toISOString().split('T')[0],
      },
      {
        onSuccess: () => {
          // 서버 통신이 '성공'했을 때만 편집 모드를 종료합니다.
          setIsEditMode(false);
        },
      },
    );
  };

  const handleClose = () => {
    if (editedTask.notes !== task.notes) {
      updateTask({
        ...editedTask,
        updateDate: new Date().toISOString().split('T')[0],
      });
    }
    onClose();
  };

  const handleChatClose = () => {
    setIsChatOpen(!isChatOpen);
  };

  // 읽기 전용 뷰 (기본 화면)
  const TeamView = () => {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusPill(editedTask.status)}`}
            >
              {getStatusText(editedTask.status)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAssignee ? (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="cursor-pointer rounded-lg p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-600"
                aria-label="edit"
                title="편집하기"
              >
                <IconEdit className="text-lg" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleChatClose}
              className={`cursor-pointer rounded-lg p-2 ${isChatOpen ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-600'}`}
            >
              <IconChat className="text-lg" />
            </button>

            {/* ✅ 팀원 화면에도 나가기 버튼 추가 */}
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50"
            >
              <IconClose className="text-lg" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">{editedTask.title}</h2>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">담당자</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                    {(editedTask.assignee || '?').slice(0, 1)}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{editedTask.assignee || '-'}</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">마감일</p>
                <p className="text-sm font-medium text-gray-900">
                  {editedTask.dueDate ? formatDateDot(editedTask.dueDate) : '-'}
                </p>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">상태</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${getStatusDotColor(editedTask.status)}`}
                  ></span>
                  <p className="text-sm font-medium text-gray-900">
                    {getStatusText(editedTask.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-gray-800">태그</p>
            <div className="flex flex-wrap gap-2">
              {editedTask.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
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

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">메모</h3>

            {/*<button*/}
            {/*    type="button"*/}
            {/*    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium cursor-default"*/}
            {/*>*/}
            {/*  미리보기*/}
            {/*</button>*/}
          </div>

          {/* 마크다운 노트 */}
          <TaskNote
            notes={editedTask.notes}
            onChange={(text) => {
              setEditedTask({ ...editedTask, notes: text });
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative flex h-full w-full items-center justify-center p-4">
        <div
          className={`flex h-[92vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 ${isChatOpen ? 'max-w-7xl' : 'max-w-4xl'}`}
        >
          {isEditMode ? (
            <TaskModalEditor
              editedTask={editedTask}
              setEditedTask={setEditedTask}
              teamMembers={members}
              onSave={handleSave}
              onCancel={() => setIsEditMode(false)}
              isChatOpen={isChatOpen}
              onChatToggle={handleChatClose}
            />
          ) : (
            TeamView()
          )}
          {/* 오른쪽 채팅 패널 */}
          {isChatOpen && (
            <TaskChat
              onChatClose={handleChatClose}
              currentUser={myUserName}
              leaderName={leaderName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
