import { useEffect, useMemo, useState } from 'react';
import { formatDateDot, formatFileSize } from '@/features/tasks/utils/task-format.js';
import {
  getStatusColor,
  getStatusDotColor,
  getStatusText,
} from '@/features/tasks/utils/task-status.js';
import { useDeleteFiles } from '@/features/files/api/useDeleteFiles.js';
import { useUploadFiles } from '@/features/files/api/useUploadFiles.js';
import { useUpdateTask } from '@/features/tasks/api/useUpdateTask.js';
import { useMirumAI } from '@/features/ai/hooks/useMirumAI.js';
import TaskChat from '@/features/chat/components/TaskChat.jsx';
import TaskNote from '@/features/note/components/TaskNote.jsx';
import TaskEditor from '@/features/tasks/components/TaskEditor.jsx';
import {
  IconAdd,
  IconAttachment,
  IconCalendar,
  IconChat,
  IconClose,
  IconEdit,
  IconFileGeneric,
  IconNote,
  IconTag,
} from '@/shared/assets/icons.js';
import { UserProfileImg } from '@/shared/components/index.js';
import { IconButton } from '@/shared/components/ui/index.js';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock.js';

/**
 * Task 상세 모달 컴포넌트
 * @typedef {import('@/types/task.js').TaskData} TaskData
 * @typedef {import('@/types/file.js').FileListItem} FileListItem
 * @typedef {import('@/features/members/types/member.js').ProjectMember} ProjectMember
 * @param {object} props
 * @param {string | number} props.projectId
 * @param {TaskData} props.task
 * @param {ProjectMember[]} props.members
 * @param {FileListItem[]} props.files
 * @param {string} props.myUserName
 * @param {string} [props.leaderName]
 * @param {() => void} props.onClose
 */
export default function TaskModal(props) {
  const { projectId, task, members, files, onClose, myUserName, leaderName } = props;
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task, notes: task.notes || '' });

  // region AI 및 채팅 관련 상태
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { summarizeNotes, isLoading: isAiLoading } = useMirumAI();
  // endregion

  const { mutate: updateTask } = useUpdateTask();
  const { mutate: uploadFiles, isPending: isUploading } = useUploadFiles();
  const { mutate: deleteFiles, isPending: isDeleting } = useDeleteFiles();
  const normalizedProjectId = Number(projectId);
  const normalizedTaskProjectId = Number(task.projectId);

  const taskContext = useMemo(
    () => ({
      taskId: task.taskId,
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assigneeName,
      dueDate: task.dueDate,
      notes: editedTask.notes,
    }),
    [task, editedTask.notes],
  );

  const hasNoteChanged = useMemo(() => {
    const previousNote = task.notes || '';
    const nextNote = editedTask.notes || '';
    return previousNote !== nextNote;
  }, [task.notes, editedTask.notes]);

  useEffect(() => {
    setEditedTask({ ...task, notes: task.notes || '' });
    setIsEditMode(false);
    setIsChatOpen(false);
  }, [task]);

  useBodyScrollLock(!!task);

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;
    uploadFiles({
      projectId: normalizedProjectId,
      taskId: Number(task.taskId),
      files: selectedFiles,
    });
    event.target.value = '';
  };

  const handleRemoveAttachment = (fileUuid) => {
    if (!fileUuid) return;
    const target = files.find((file) => file.uuid === fileUuid);
    if (!target) return;
    deleteFiles({ selectedFiles: [target], projectId: normalizedProjectId });
  };

  const handleSave = () => {
    const normalizedStartDate = editedTask.startDate
      ? String(editedTask.startDate).slice(0, 10)
      : null;
    const normalizedDueDate = editedTask.dueDate ? String(editedTask.dueDate).slice(0, 10) : null;

    updateTask(
      {
        requestData: {
          taskId: editedTask.taskId,
          title: editedTask.title,
          description: editedTask.description,
          status: editedTask.status,
          assigneeId: editedTask.assigneeId,
          assigneeName: editedTask.assigneeName,
          startDate: normalizedStartDate,
          dueDate: normalizedDueDate,
          tags: editedTask.tags,
          notes: editedTask.notes,
        },
        projectId: normalizedTaskProjectId,
      },
      {
        onSuccess: () => setIsEditMode(false),
      },
    );
  };

  const handleClose = () => {
    if (hasNoteChanged) {
      updateTask(
        {
          requestData: { taskId: editedTask.taskId, notes: editedTask.notes },
          projectId: normalizedTaskProjectId,
        },
        {
          onSuccess: () => setIsEditMode(false),
        },
      );
    }
    onClose();
  };

  const handleAiSummarize = async () => {
    if (!editedTask.notes?.trim()) return;
    try {
      const summary = await summarizeNotes(editedTask.notes);
      setEditedTask((prev) => ({ ...prev, notes: prev.notes + '\n\n### AI 요약\n' + summary }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div
        className={`relative flex h-[92vh] w-full overflow-hidden rounded-[40px] bg-white shadow-2xl ring-1 ring-black/5 ${isChatOpen ? 'max-w-[1760px]' : 'max-w-5xl'}`}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          {isEditMode ? (
            <TaskEditor
              editedTask={editedTask}
              setEditedTask={setEditedTask}
              teamMembers={members}
              projectId={normalizedProjectId}
              onSave={handleSave}
              onCancel={() => setIsEditMode(false)}
              onDeleteSuccess={onClose}
            />
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden bg-white">
              {/* Sticky Header Row */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/95 px-8 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${getStatusDotColor(editedTask.status)} shadow-sm`}
                  />
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(editedTask.status)}`}
                  >
                    {getStatusText(editedTask.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <IconButton
                    type="button"
                    onClick={() => setIsChatOpen((prev) => !prev)}
                    aria-label="팀원 & AI 채팅 열기"
                    title="팀원 & AI 채팅"
                    className={`${
                      isChatOpen
                        ? 'border-blue-600 bg-blue-600 text-white shadow-blue-100'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconChat size={18} />
                  </IconButton>

                  <IconButton
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="text-gray-700"
                    title="편집하기"
                  >
                    <IconEdit size={20} />
                  </IconButton>

                  <IconButton type="button" onClick={handleClose} className="text-gray-700">
                    <IconClose size={20} />
                  </IconButton>
                </div>
              </div>

              <div className="custom-scrollbar flex-1 overflow-y-auto px-8 py-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <section className="mb-10">
                  <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900">
                    {editedTask.title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-lg font-medium leading-relaxed text-gray-600">
                    {editedTask.description || '작업 설명이 없습니다.'}
                  </p>
                </section>

                <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-7 shadow-sm">
                  <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        담당자
                      </p>
                      <div className="flex items-center gap-3">
                        <UserProfileImg name={editedTask.assigneeName} size="md" />
                        <p className="text-base font-semibold text-gray-900">
                          {editedTask.assigneeName || '미지정'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        마감일
                      </p>
                      <div className="flex items-center gap-2.5 font-semibold text-gray-900">
                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                          <IconCalendar size={18} />
                        </div>
                        {editedTask.dueDate ? formatDateDot(editedTask.dueDate) : '기한 없음'}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        상태
                      </p>
                      <div className="flex items-center gap-2.5 font-semibold text-gray-900">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${getStatusDotColor(editedTask.status)} shadow-sm`}
                        />
                        {getStatusText(editedTask.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <div className="mb-4 flex items-center gap-2">
                    <IconTag size={18} className="text-gray-400" />
                    <p className="text-sm font-medium text-gray-800">태그</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editedTask.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-2 text-sm font-medium text-blue-700"
                      >
                        #{tag}
                      </span>
                    ))}
                    {(!editedTask.tags || editedTask.tags.length === 0) && (
                      <p className="py-1 text-sm text-gray-400">등록된 태그가 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="mt-10 rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                        <IconAttachment size={18} />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        첨부파일{' '}
                        <span className="ml-1 font-medium text-gray-400">{files.length}</span>
                      </p>
                    </div>

                    <label
                      htmlFor="task-attachment-upload"
                      className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
                        isUploading
                          ? 'cursor-not-allowed border-gray-100 bg-gray-100 text-gray-400'
                          : 'cursor-pointer border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-600'
                      }`}
                    >
                      <IconAdd size={18} className="mr-1.5" />
                      {isUploading ? '업로드 중...' : '파일 추가'}
                    </label>
                    <input
                      id="task-attachment-upload"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </div>

                  {files.length === 0 ? (
                    <div className="rounded-3xl bg-gray-50/30 py-10 text-center">
                      <p className="text-sm text-gray-400">첨부된 파일이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {files.map((file) => (
                        <div
                          key={file.uuid}
                          className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-blue-500">
                              <IconFileGeneric size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-800">
                                {file.originalFilename || file.name}
                              </p>
                              <p className="mt-0.5 text-[10px] font-semibold uppercase text-gray-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAttachment(file.uuid)}
                            disabled={isDeleting}
                            className="shrink-0 p-2 text-gray-400 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                          >
                            <IconClose size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-12">
                  <TaskNote
                    notes={editedTask.notes}
                    isReadOnly={false}
                    onChange={(text) => setEditedTask({ ...editedTask, notes: text })}
                    onAiSummarize={handleAiSummarize}
                    isAiLoading={isAiLoading}
                    headerContent={
                      <div className="flex items-center gap-2">
                        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                          <IconNote size={18} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">작업 메모</h3>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {isChatOpen && (
          <TaskChat
            taskId={task.taskId}
            onChatClose={() => setIsChatOpen(false)}
            currentUser={myUserName}
            leaderName={leaderName}
            taskContext={taskContext}
          />
        )}
      </div>
    </div>
  );
}
