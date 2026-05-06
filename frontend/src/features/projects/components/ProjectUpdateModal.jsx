import { useState } from 'react';
import { useUpdateProject } from '@/features/projects/api/useUpdateProject.js';
import { IconClose } from '@/shared/assets/icons.js';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock.js';

/**
 * @typedef {import('@/types/project.js').ProjectDTO} ProjectDTO
 * @param {object} props
 * @param {string | number} props.projectId - 프로젝트 ID
 * @param {ProjectDTO} props.project - 프로젝트 상세 정보
 * @param {() => void} props.onClose - 모달 닫기 함수
 * @param {string} [props.error] - 에러 메시지
 */

/**
 * 프로젝트 수정을 위한 모달 컴포넌트입니다.
 * @param {object} props
 * @returns {JSX.Element | null}
 */
export default function ProjectUpdateModal(props) {
  const { projectId, project, onClose } = props;
  const [projectTitle, setProjectTitle] = useState(project?.projectName || '');
  const [projectDesc, setProjectDesc] = useState(project?.description || '');

  const { mutate: updateProject } = useUpdateProject();

  useBodyScrollLock(true);

  if (!project) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateProject(
      {
        projectId: projectId,
        projectName: projectTitle,
        description: projectDesc,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in relative w-full max-w-[440px] rounded-[32px] bg-card p-12 text-card-foreground shadow-2xl ring-1 ring-black/5 duration-200 dark:ring-white/10">
        <button
          type="button"
          className="absolute right-6 top-6 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={handleClose}
        >
          <IconClose size={24} />
        </button>

        <header className="mb-10 text-center">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Edit Workspace
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">프로젝트 수정</h1>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Project Title
            </label>
            <input
              type="text"
              value={projectTitle}
              placeholder="프로젝트 이름"
              className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setProjectTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Description
            </label>
            <textarea
              value={projectDesc}
              placeholder="프로젝트 설명"
              className="min-h-[100px] w-full resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setProjectDesc(event.target.value)}
            />
            {props.error && <p className="mt-1 text-xs font-medium text-red-500">{props.error}</p>}
          </div>

          <button
            disabled={!projectTitle}
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
          >
            수정하기
          </button>
        </form>
      </div>
    </div>
  );
}
