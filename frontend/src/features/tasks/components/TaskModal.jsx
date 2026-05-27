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
import { useGetTaskDetails } from '@/features/tasks/api/useGetTaskDetails.js';
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
import { useDragScroll } from '@/shared/hooks/useDragScroll.js';

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
  const { projectId, task: initialTask, members, files, onClose, myUserName, leaderName } = props;
  const normalizedProjectId = Number(projectId);
  const taskId = Number(initialTask.taskId);

  // 상세 데이터 가져오기
  const { data: detailTask, isLoading: isDetailLoading } = useGetTaskDetails({
    projectId: normalizedProjectId,
    taskId,
  });

  // 실제 화면에서 사용할 태스크 데이터 (상세 데이터가 오기 전까진 초기 요약 데이터 사용)
  const currentTask = detailTask || initialTask;

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...currentTask, notes: currentTask.notes || '' });
  
  // 데이터 동기화: 상세 정보가 로드되면 편집 상태 업데이트 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (!isEditMode) {
      setEditedTask({ ...currentTask, notes: currentTask.notes || '' });
    }
  }, [currentTask, isEditMode]);

  const { ref: scrollRef, onMouseDown, onMouseLeave, onMouseUp, onMouseMove, isDragging } = useDragScroll();

  // region AI 및 채팅 관련 상태
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { summarizeNotes, isLoading: isAiLoading } = useMirumAI();
  // endregion

  const { mutate: updateTask } = useUpdateTask();
  const { mutate: uploadFiles, isPending: isUploading } = useUploadFiles();
  const { mutate: deleteFiles, isPending: isDeleting } = useDeleteFiles();

  const hasNoteChanged = useMemo(() => {
    const previousNote = currentTask.notes || '';
    const nextNote = editedTask.notes || '';
    return previousNote !== nextNote;
  }, [currentTask.notes, editedTask.notes]);

  useEffect(() => {
    setEditedTask({ ...currentTask, notes: currentTask.notes || '' });
    setIsEditMode(false);
    setIsChatOpen(false);
  }, [currentTask.taskId]); // ID가 바뀔 때만 리셋

  useBodyScrollLock(!!currentTask);

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;
    uploadFiles({
      projectId: normalizedProjectId,
      taskId: Number(currentTask.taskId),
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
    const normalizedDueDate = editedTask.dueDate
      ? `${String(editedTask.dueDate).slice(0, 10)}T00:00:00`
      : null;

    updateTask(
      {
        requestData: {
          taskId: editedTask.taskId,
          title: editedTask.title,
          description: editedTask.description,
          status: editedTask.status,
          assigneeId: editedTask.assigneeId,
          dueDate: normalizedDueDate,
          tags: editedTask.tags,
          notes: editedTask.notes,
        },
        projectId: normalizedProjectId,
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
          projectId: normalizedProjectId,
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
        className={`relative flex h-[92vh] w-full overflow-hidden rounded-[40px] bg-card shadow-2xl ring-1 ring-black/5 dark:ring-white/5 ${isChatOpen ? 'max-w-[1760px]' : 'max-w-5xl'}`}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          {isDetailLoading && !detailTask ? (
            <div className="flex flex-1 items-center justify-center">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
            </div>
          ) : isEditMode ? (
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
            <div className="flex flex-1 flex-col overflow-hidden bg-card">
              {/* Sticky Header Row */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-8 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${getStatusDotColor(currentTask.status)} shadow-sm`}
                  />
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(currentTask.status)}`}
                  >
                    {getStatusText(currentTask.status)}
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
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    <IconChat size={18} />
                  </IconButton>

                  <IconButton
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="text-foreground"
                    title="편집하기"
                  >
                    <IconEdit size={20} />
                  </IconButton>

                  <IconButton type="button" onClick={handleClose} className="text-foreground">
                    <IconClose size={20} />
                  </IconButton>
                </div>
              </div>

              <div 
                ref={scrollRef}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                className={`hide-scrollbar flex-1 overflow-y-auto px-8 py-8 ${isDragging ? 'cursor-grabbing' : 'cursor-auto'}`}
              >
                <section className="mb-10">
                  <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground">
                    {currentTask.title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-lg font-medium leading-relaxed text-muted-foreground">
                    {currentTask.description || '작업 설명이 없습니다.'}
                  </p>
                </section>

                <div className="rounded-3xl border border-border bg-muted/50 p-7 shadow-sm">
                  <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        담당자
                      </p>
                      <div className="flex items-center gap-3">
                        <UserProfileImg name={currentTask.assigneeName} size="md" />
                        <p className="text-base font-semibold text-foreground">
                          {currentTask.assigneeName || '미지정'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        마감일
                      </p>
                      <div className="flex items-center gap-2.5 font-semibold text-foreground">
                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <IconCalendar size={18} />
                        </div>
                        {currentTask.dueDate ? formatDateDot(currentTask.dueDate) : '기한 없음'}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        상태
                      </p>
                      <div className="flex items-center gap-2.5 font-semibold text-foreground">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${getStatusDotColor(currentTask.status)} shadow-sm`}
                        />
                        {getStatusText(currentTask.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 rounded-[32px] border border-border bg-card p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                  <div className="mb-4 flex items-center gap-2">
                    <IconTag size={18} className="text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">태그</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentTask.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        #{tag}
                      </span>
                    ))}
                    {(!currentTask.tags || currentTask.tags.length === 0) && (
                      <p className="py-1 text-sm text-muted-foreground">등록된 태그가 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="mt-10 rounded-[32px] border border-border bg-card p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <IconAttachment size={18} />
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        첨부파일{' '}
                        <span className="ml-1 font-medium text-muted-foreground">{files.length}</span>
                      </p>
                    </div>

                    <label
                      htmlFor="task-attachment-upload"
                      className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
                        isUploading
                          ? 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                          : 'cursor-pointer border-border bg-card text-foreground hover:border-primary hover:text-primary'
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
                    <div className="rounded-3xl bg-muted/30 py-10 text-center">
                      <p className="text-sm text-muted-foreground">첨부된 파일이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {files.map((file) => (
                        <div
                          key={file.uuid}
                          className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-blue-500 dark:text-blue-400">
                              <IconFileGeneric size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {file.originalFilename || file.name}
                              </p>
                              <p className="mt-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
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
                        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <IconNote size={18} />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">작업 메모</h3>
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
            projectId={normalizedProjectId}
            taskId={currentTask.taskId}
            onChatClose={() => setIsChatOpen(false)}
            currentUser={myUserName}
            leaderName={leaderName}
          />
        )}
      </div>
    </div>
  );
}
