import { useState } from 'react';
import { getStatusDotColor } from '@/features/tasks/utils/task-status.js';
import { useDeleteTask } from '@/features/tasks/api/useDeleteTask.js';
import TaskNote from '@/features/note/components/TaskNote.jsx';
import { IconAdd, IconClose, IconHashtag, IconSave, IconTrash } from '@/shared/assets/icons.js';
import { Button, DialogHeader, IconButton } from '@/shared/components/ui/index.js';

/**
 * 작업 편집 모드 컴포넌트
 * @param props
 */
export default function TaskEditor(props) {
  const { editedTask, setEditedTask, teamMembers, onSave, onCancel, onDeleteSuccess, projectId } =
    props;
  const { mutate: deleteTask } = useDeleteTask();
  const [newTag, setNewTag] = useState('');

  const inputBase =
    'w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/15';
  const panelCard =
    'rounded-[28px] border border-border bg-card p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10';

  const toDateInputValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10);
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return '';
  };

  const handleDelete = (event) => {
    event.preventDefault();
    if (window.confirm('정말로 이 작업을 삭제하시겠습니까?')) {
      const targetProjectId = Number(projectId ?? editedTask.projectId);
      deleteTask(
        { taskId: Number(editedTask.taskId), projectId: targetProjectId },
        {
          onSuccess: () => {
            if (onDeleteSuccess) {
              onDeleteSuccess();
              return;
            }
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
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <DialogHeader className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-8 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-2.5 w-2.5 rounded-full ${getStatusDotColor(editedTask.status)} animate-pulse`}
          ></div>
          <h2 className="text-lg font-black tracking-tight text-foreground">작업 정보 편집</h2>
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            onClick={onSave}
            className="border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
            title="저장"
          >
            <IconSave size={18} />
          </IconButton>
          <IconButton onClick={onCancel} className="text-muted-foreground" title="취소">
            <IconClose size={18} />
          </IconButton>
        </div>
      </DialogHeader>

      <div className="custom-scrollbar flex-1 overflow-y-auto bg-muted/30 px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Side Panel: Metadata */}
          <div className="space-y-6 lg:col-span-1">
            <div className={panelCard}>
              <h3 className="mb-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                설정 상세
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    담당자 변경
                  </label>
                  <select
                    value={editedTask.assigneeId || ''}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      const selectedMember = teamMembers.find(
                        (member) => member.username === val,
                      );
                      setEditedTask({
                        ...editedTask,
                        assigneeId: val,
                        assigneeName: selectedMember?.nickname || selectedMember?.username || (val ? '' : '미지정'),
                      });
                    }}
                    className={inputBase}
                  >
                    <option value="">미지정 (나중에 배정)</option>
                    {teamMembers.map((member) => (
                      <option key={member.username} value={member.username}>
                        {member.nickname} (@{member.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={toDateInputValue(editedTask.startDate)}
                      onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      마감일
                    </label>
                    <input
                      type="date"
                      min={toDateInputValue(editedTask.startDate)}
                      value={toDateInputValue(editedTask.dueDate)}
                      onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    현재 상태
                  </label>
                  <select
                    value={editedTask.status}
                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                    className={inputBase}
                  >
                    <option value="TODO">대기 (TODO)</option>
                    <option value="IN_PROGRESS">진행중 (IN PROGRESS)</option>
                    <option value="DONE">완료 (DONE)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tag Editor */}
            <div className={panelCard}>
              <h3 className="mb-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                태그 관리
              </h3>
              <div className="relative mb-4">
                <IconAdd
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={addTag}
                />
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="태그 추가..."
                  className={`${inputBase} pr-12`}
                />
              </div>
              <div className="custom-scrollbar flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1">
                {(editedTask.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    <IconHashtag size={12} />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="transition-colors hover:text-red-500"
                    >
                      <IconClose size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <Button
              onClick={handleDelete}
              variant="outline"
              className="h-auto w-full justify-center gap-2 rounded-[22px] border-red-200 py-3.5 text-sm font-bold text-red-600 transition-all hover:bg-red-500/15 dark:border-red-500/40"
            >
              <IconTrash size={18} />
              작업 삭제하기
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6 lg:col-span-2">
            <div className={panelCard}>
              <h3 className="mb-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                작업 제목
              </h3>
              <input
                type="text"
                value={editedTask.title || ''}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full border-none bg-transparent p-0 text-2xl font-black text-foreground outline-none placeholder:text-muted-foreground/50"
                placeholder="작업 제목을 입력하세요"
              />
            </div>

            <div className={panelCard}>
              <h3 className="mb-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                작업 설명
              </h3>
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full resize-none border-none bg-transparent p-0 text-base font-medium text-muted-foreground outline-none placeholder:text-muted-foreground/50"
                rows={4}
                placeholder="상세 내용을 입력하세요..."
              />
            </div>

            <div className={panelCard}>
              <h3 className="mb-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                상세 메모
              </h3>
              <TaskNote
                notes={editedTask.notes || ''}
                onChange={(text) => setEditedTask({ ...editedTask, notes: text })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
