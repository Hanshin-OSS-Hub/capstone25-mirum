import { useState } from 'react';
import { useCreateProject } from '@/features/projects/api/useCreateProject.js';
import { IconClose } from '@/shared/assets/icons.js';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogOverlay,
  IconButton,
  Input,
} from '@/shared/components/ui/index.js';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock.js';

/**
 * @typedef {object} CreateProjectProps
 * @property {boolean} isOpen - 모달 열림 상태
 * @property {() => void} onClose - 모달 닫기 함수
 */

/**
 * 프로젝트 생성을 위한 모달 컴포넌트입니다.
 * @param {CreateProjectProps} props
 * @returns {JSX.Element | null}
 */
export default function CreateProject(props) {
  const { isOpen, onClose } = props;
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [error, setError] = useState('');

  const { mutate: createProject } = useCreateProject();

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleClose = () => {
    setProjectTitle('');
    setProjectDesc('');
    setError('');
    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!projectTitle.trim()) {
      setError('프로젝트 제목을 입력해주세요.');
      return;
    }

    createProject(
      {
        projectName: projectTitle,
        description: projectDesc,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen}>
      <DialogOverlay onClick={handleClose} className="z-[9998] bg-slate-900/45" />
      <DialogContent className="z-[9999] max-w-[440px] rounded-[32px]">
        <DialogBody className="p-12">
          {/* 닫기 버튼 */}
          <IconButton
            type="button"
            className="absolute right-6 top-6 rounded-full text-gray-400 hover:text-gray-600"
            onClick={handleClose}
          >
            <IconClose size={24} />
          </IconButton>

          <header className="mb-10 text-center">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              New Workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">프로젝트 생성</h1>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Project Title
              </label>
              <Input
                type="text"
                className="h-auto bg-gray-50 py-3 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                placeholder="프로젝트 이름을 입력하세요"
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Description (Optional)
              </label>
              <textarea
                className="min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                placeholder="프로젝트를 간단히 설명해주세요"
                value={projectDesc}
                onChange={(event) => setProjectDesc(event.target.value)}
              />
              {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                disabled={!projectTitle.trim()}
                type="submit"
                className="h-auto w-full py-3.5 shadow-blue-500/20 hover:shadow-blue-500/30"
              >
                생성하기
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="h-auto w-full py-3.5 text-gray-600"
                onClick={handleClose}
              >
                취소
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
