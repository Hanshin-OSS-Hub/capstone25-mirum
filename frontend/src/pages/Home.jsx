import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { useGetDeletedProject } from '@/features/projects/api/useGetDeletedProject.js';
import { useGetProjectList } from '@/features/projects/api/useGetProjectList.js';
import { usePermanentDeleteProject } from '@/features/projects/api/usePermanentDeleteProject.js';
import { useRestoreProject } from '@/features/projects/api/useRestoreProject.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import { formatLocalDateTime } from '@/features/tasks/utils/task-format.js';
import CreateProjectModal from '@/features/projects/components/CreateProject.jsx';
import {
  IconFolder,
  IconFolder5,
  IconGroup,
  IconRefresh,
  IconTrash,
} from '@/shared/assets/icons.js';
import LoadingSpinner from '@/shared/components/LoadingSpinner.jsx';
import { Header } from '@/shared/components/index.js';
import { EmptyState, ErrorState } from '@/shared/components/ui/index.js';

/**
 * 대시보드 홈 페이지 컴포넌트
 */
export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(false); // 수동 갱신 체크용

  const myNickname = user?.nickname || '사용자';

  // 1. 프로젝트 목록 조회
  const {
    data: projects,
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
    isError: isProjectsError,
    error: projectsError,
    refetch: refetchProjects,
  } = useGetProjectList();

  // 2. 삭제된 프로젝트 목록 조회
  const {
    data: deletedProjects = [],
    isLoading: isDeletedLoading,
    isFetching: isDeletedFetching,
    isError: isDeletedError,
    error: deletedError,
    refetch: refetchDeleted,
  } = useGetDeletedProject();

  const { mutate: restoreProject } = useRestoreProject();
  const { mutate: permanentDeleteProject } = usePermanentDeleteProject();

  const handleRestore = (projectId) => {
    if (window.confirm('이 프로젝트를 복구하시겠습니까?')) {
      restoreProject(projectId);
    }
  };

  const handlePermanentDelete = (projectId) => {
    if (
      window.confirm('이 프로젝트를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    ) {
      permanentDeleteProject(projectId);
    }
  };

  // 수동 리프레시 로직: 오버레이를 위해 로컬 상태 제어
  const handleRefreshAll = async () => {
    setIsManualLoading(true);
    await Promise.all([refetchProjects(), refetchDeleted()]);
    setIsManualLoading(false);
  };

  const isInitialLoading = isProjectsLoading || isDeletedLoading;
  const isAnyFetching = isProjectsFetching || isDeletedFetching;

  return (
    <div className="min-h-screen bg-background">
      {/* 1. 최초 진입 로딩 또는 2. 수동 갱신 시에만 오버레이 표시 */}
      {(isInitialLoading || isManualLoading) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
          <LoadingSpinner
            size="lg"
            label={
              isInitialLoading
                ? '대시보드를 준비 중입니다...'
                : '최신 데이터를 가져오는 중입니다...'
            }
          />
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refetchProjects();
        }}
      />

      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Header />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Dashboard Title Section */}
        <header className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              내 대시보드
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              안녕하세요, {myNickname}님! 오늘의 프로젝트 현황입니다.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95 sm:w-auto sm:px-6"
            >
              + 새 프로젝트
            </button>
          </div>
        </header>

        <main className="space-y-10 sm:space-y-12">
          {/* Project List Section */}
          <div className="space-y-8">
            <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black text-foreground sm:text-2xl">진행 중인 프로젝트</h2>
              <button
                onClick={handleRefreshAll}
                disabled={isAnyFetching}
                type="button"
                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-4 py-2 text-sm font-bold text-muted-foreground shadow-sm ring-1 ring-black/5 transition-all hover:bg-blue-50 hover:text-blue-600 hover:ring-blue-100 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground`}
              >
                <IconRefresh size={16} className={isAnyFetching ? 'animate-spin' : ''} />
                목록 새로고침
              </button>
            </div>

            {isProjectsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner size="lg" label="프로젝트를 불러오는 중..." />
              </div>
            ) : isProjectsError ? (
              <ErrorState
                title="프로젝트 목록을 불러오지 못했습니다."
                message={getErrorMessage(projectsError, '잠시 후 다시 시도해 주세요.')}
                onRetry={handleRefreshAll}
                className="h-64"
              />
            ) : (
              <>
                {!Array.isArray(projects) || projects.length === 0 ? (
                  <EmptyState
                    title="프로젝트가 없습니다"
                    description="새로운 프로젝트를 생성하여 협업을 시작해보세요!"
                    actionLabel="새 프로젝트 생성"
                    onAction={() => setIsModalOpen(true)}
                    className="rounded-[40px] border-2 border-dashed border-border"
                  />
                ) : (
                  <section className="space-y-6">
                    <div className="project-grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {projects.map((p) => (
                        <div
                          key={p.projectId}
                          className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/25 hover:shadow-xl sm:rounded-[40px] sm:p-8"
                          onClick={() => navigate(`/project/${p.projectId}`)}
                        >
                          <div className="absolute right-0 top-0 p-8 text-blue-50/50 transition-colors group-hover:text-blue-100/50">
                            <IconFolder5 size={96} className="-mr-4 -mt-4" />
                          </div>

                          <div className="relative z-10 space-y-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                              <IconFolder size={24} />
                            </div>

                            <div>
                              <h3 className="text-xl font-black text-foreground transition-colors group-hover:text-primary">
                                {p?.projectName}
                              </h3>
                              <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-muted-foreground">
                                {p?.description || '프로젝트 설명이 없습니다.'}
                              </p>
                            </div>

                            <div className="space-y-3 pt-2">
                              <div className="flex items-end justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                  진행도
                                </span>
                                <span className="text-xs font-bold text-primary">
                                  {p?.taskProgress || 0}%
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all duration-1000"
                                  style={{ width: `${p?.taskProgress || 0}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border pt-4 text-[11px] font-semibold text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <IconGroup size={14} />
                                <span>{p.memberCount || 0}명 참여 중</span>
                              </div>
                              <span>{formatLocalDateTime(p.creationDate)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {!isDeletedLoading && !isDeletedError && deletedProjects?.length > 0 && (
              <section className="space-y-6 pt-10">
                <div className="flex items-center gap-3">
                  <IconTrash size={20} className="text-muted-foreground" />
                  <h2 className="text-xl font-black text-foreground">삭제된 프로젝트</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {deletedProjects.map((p) => (
                    <div
                      key={p.projectId}
                      className="group flex items-center justify-between rounded-[32px] border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <IconFolder size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{p.projectName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(p.projectId)}
                          className="rounded-xl p-2 text-blue-600 transition-all hover:bg-blue-50"
                          title="복구하기"
                        >
                          <IconRefresh size={18} />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(p.projectId)}
                          className="rounded-xl p-2 text-red-600 transition-all hover:bg-red-50"
                          title="영구 삭제"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!isDeletedLoading && isDeletedError && (
              <section className="rounded-[28px] border border-border bg-card p-5">
                <p className="text-sm font-medium text-muted-foreground">
                  삭제된 프로젝트 목록을 불러오지 못했습니다:{' '}
                  {getErrorMessage(deletedError, '알 수 없는 오류')}
                </p>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
