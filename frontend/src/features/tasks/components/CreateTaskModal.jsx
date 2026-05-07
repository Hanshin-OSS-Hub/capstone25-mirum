import { useEffect, useMemo, useState } from 'react';
import { useCreateTask } from '@/features/tasks/api/useCreateTask.js';
import { IconClose, /*IconAdd,*/ IconHashtag } from '@/shared/assets/icons.js';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  IconButton,
  Input,
} from '@/shared/components/ui/index.js';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock.js';
import { useDragScroll } from '@/shared/hooks/useDragScroll.js';

/**
 * 새 작업 생성 모달 컴포넌트
 * @param props
 */
export default function CreateTaskModal(props) {
  const { projectId, isOpen, onClose, defaultAssigneeId, members = [] } = props;
  const { mutate: createTask } = useCreateTask();

  const sortedMembers = useMemo(() => {
    const myMember = members.find((m) => m.username === defaultAssigneeId);
    const others = members.filter((m) => m.username !== defaultAssigneeId);
    return myMember ? [myMember, ...others] : others;
  }, [members, defaultAssigneeId]);

  const todayISO = new Date().toISOString().split('T')[0];

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    tags: [],
    assigneeId: '',
    startDate: todayISO,
    dueDate: todayISO,
  });
  const [newTag, setNewTag] = useState('');

  useBodyScrollLock(isOpen);
  const { ref: scrollRef, onMouseDown, onMouseLeave, onMouseUp, onMouseMove, isDragging } = useDragScroll();

  useEffect(() => {
    if (isOpen) {
      setTaskData({
        title: '',
        description: '',
        status: 'TODO',
        tags: [],
        assigneeId: defaultAssigneeId || '',
        startDate: todayISO,
        dueDate: todayISO,
      });
      setNewTag('');
    }
  }, [defaultAssigneeId, isOpen, todayISO]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!taskData.title.trim()) return;

    const selectedMember = sortedMembers.find((m) => m.username === taskData.assigneeId);
    const requestData = {
      ...taskData,
      title: taskData.title.trim(),
      projectId: Number(projectId),
      assigneeId: selectedMember ? selectedMember.username : null,
      assigneeName: selectedMember ? selectedMember.nickname : null,
    };

    createTask(
      { requestBody: requestData, projectId: Number(projectId) },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !taskData.tags.includes(trimmed)) {
      setTaskData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTaskData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
  };

  const inputBase =
    'w-full rounded-2xl border border-border bg-muted/50 px-5 py-3 text-sm font-bold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/15';

  return (
    <Dialog open={isOpen}>
      <DialogOverlay onClick={onClose} />
      <DialogContent className="max-w-[min(800px,calc(100vw-2rem))] duration-300">
        {/* Header */}
        <DialogHeader className="flex items-center justify-between px-5 py-6 sm:px-10 sm:py-8">
          <div>
            <DialogTitle>새 작업 만들기</DialogTitle>
            <DialogDescription>팀의 목표를 달성하기 위한 첫 걸음입니다.</DialogDescription>
          </div>
          <IconButton
            onClick={onClose}
            className="rounded-full text-muted-foreground transition-colors hover:bg-muted"
          >
            <IconClose size={28} />
          </IconButton>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col">
          <DialogBody 
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className={`hide-scrollbar flex-1 space-y-6 overflow-y-auto p-5 sm:space-y-8 sm:p-10 ${isDragging ? 'cursor-grabbing' : 'cursor-auto'}`}
          >
            <section className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">
                  작업 제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  placeholder="무엇을 해야 하나요?"
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">
                  작업 설명
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  placeholder="팀원들이 이해할 수 있게 자세히 적어주세요."
                  rows={3}
                  className={`${inputBase} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">
                    담당자
                  </label>
                  <select
                    value={taskData.assigneeId}
                    onChange={(e) => setTaskData({ ...taskData, assigneeId: e.target.value })}
                    className={inputBase}
                  >
                    <option value="">미지정 (나중에 배정)</option>
                    {sortedMembers.map((m) => (
                      <option key={m.username} value={m.username}>
                        {m.nickname} (@{m.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">
                    초기 상태
                  </label>
                  <select
                    value={taskData.status}
                    onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                    className={inputBase}
                  >
                    <option value="TODO">대기 중 (TODO)</option>
                    <option value="IN_PROGRESS">진행 중 (IN PROGRESS)</option>
                    <option value="DONE">완료 (DONE)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={taskData.startDate}
                    className={inputBase}
                    onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">
                    마감일
                  </label>
                  <input
                    type="date"
                    min={taskData.startDate}
                    value={taskData.dueDate}
                    className={inputBase}
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">
                  태그
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <IconHashtag
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="태그 입력..."
                      className={`${inputBase} pl-11`}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="secondary"
                    className="rounded-2xl bg-foreground px-6 text-background hover:bg-foreground/90"
                  >
                    추가
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {taskData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="transition-colors hover:text-red-500"
                      >
                        <IconClose size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </DialogBody>

          <DialogFooter className="flex gap-3 p-5 sm:gap-4 sm:p-10">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="h-auto flex-1 rounded-[20px] py-4 font-bold text-muted-foreground"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="h-auto flex-1 rounded-[20px] py-4 font-bold shadow-xl shadow-blue-100"
            >
              작업 생성하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
