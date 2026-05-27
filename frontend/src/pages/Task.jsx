import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { useGetProjectFiles } from '@/features/files/api/useGetProjectFiles.js';
import { useGetInvitees } from '@/features/invitations/api/useGetInvitees.js';
import { useGetMemberList } from '@/features/members/api/useGetMemberList.js';
import { useGetProjectDetails } from '@/features/projects/api/useGetProjectDetails.js';
import { useGetTaskList } from '@/features/tasks/api/useGetTaskList.js';
import { useMirumAI } from '@/features/ai/hooks/useMirumAI.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import { formatLocalDateTime } from '@/features/tasks/utils/task-format.js';
import TaskCard from '@/features/tasks/components/TaskCard.jsx';
import TaskSummaryCard from '@/features/tasks/components/TaskSummaryCard.jsx';
import {
  IconCheckbox,
  IconRefresh,
  IconRobot,
  IconSettings,
  IconUnassigned,
  IconUserAdd,
} from '@/shared/assets/icons.js';
// 공통 컴포넌트 (정적 임포트)
import {
  Header,
  LoadingSpinner,
  NotFoundState,
  UserProfileImg,
} from '@/shared/components/index.js';
import { EmptyState, ErrorState } from '@/shared/components/ui/index.js';

// 무거운 컴포넌트 (지연 로딩 - React.lazy)
const FilePanel = lazy(() => import('@/features/files/components/FilePanel.jsx'));
const InviteMembersModal = lazy(
  () => import('@/features/members/components/InviteMembersModal.jsx'),
);
const ProjectConfigPanel = lazy(
  () => import('@/features/projects/components/ProjectConfigPanel.jsx'),
);
const ProjectReportView = lazy(() => import('@/features/ai/components/ProjectReportView.jsx'));
const CreateTaskModal = lazy(() => import('@/features/tasks/components/CreateTaskModal.jsx'));
const TaskModal = lazy(() => import('@/features/tasks/components/TaskModal.jsx'));
const TaskTimeline = lazy(() => import('@/features/tasks/components/TaskTimeline.jsx'));

const TASK_COLOR_PALETTE = [
  '#5B8DEF',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
  '#14B8A6',
];

const TASK_STATUS_ORDER = {
  IN_PROGRESS: 0,
  TODO: 1,
  DONE: 2,
};

const TASK_FILTER_OPTIONS = [
  { key: 'ALL', label: 'ALL' },
  { key: 'TODO', label: 'TODO' },
  { key: 'IN_PROGRESS', label: 'IN PROGRESS' },
  { key: 'DONE', label: 'DONE' },
];

const sortTasksForLane = (taskList) => {
  return [...taskList].sort((left, right) => {
    const leftOrder = TASK_STATUS_ORDER[left.status] ?? 99;
    const rightOrder = TASK_STATUS_ORDER[right.status] ?? 99;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    const leftUpdated = new Date(left.updatedDate).getTime();
    const rightUpdated = new Date(right.updatedDate).getTime();
    return rightUpdated - leftUpdated;
  });
};

/**
 * 프로젝트 상세 및 태스크 관리 페이지 컴포넌트
 */
export default function Task() {
  const getWeekLabel = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const week = Math.ceil(date.getDate() / 7);
    return `${year}년 ${month}월 ${week}주차`;
  };

  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { generateProjectReport, isLoading: isReportLoading } = useMirumAI();

  const myUsername = user?.username || '';

  const [defaultAssigneeId, setDefaultAssigneeId] = useState(myUsername);
  const [selectedTask, setSelectedTask] = useState(null);
  const [topTab, setTopTab] = useState('project');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [projectReport, setProjectReport] = useState('');
  const [reportHistory, setReportHistory] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [memberStatusFilters, setMemberStatusFilters] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dragState, setDragState] = useState({
    laneKey: null,
    startX: 0,
    startScrollLeft: 0,
  });

  const openTask = (task) => setSelectedTask(task);
  const closeTask = () => setSelectedTask(null);

  const openCreateTask = () => {
    setDefaultAssigneeId(myUsername);
    setIsCreateTaskModalOpen(true);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const openMainTab = (tabKey) => {
    setTopTab(tabKey);
  };

  const {
    data: project = null,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
    refetch: refetchProject,
  } = useGetProjectDetails(Number(projectId));
  const {
    data: members = [],
    isLoading: isMembersLoading,
    isFetching: isMembersFetching,
    refetch: refetchMembers,
  } = useGetMemberList(Number(projectId), myUsername);
  const { data: pendingInvites = [], refetch: refetchInvitees } = useGetInvitees(Number(projectId));
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    isFetching: isTasksFetching,
    isError: isTasksError,
    error: tasksError,
    refetch: refetchTasks,
  } = useGetTaskList({ projectId: Number(projectId) });
  const isBoardBootstrapping =
    isMembersLoading ||
    isTasksLoading ||
    (isMembersFetching && members.length === 0) ||
    (isTasksFetching && tasks.length === 0);

  const { data: files = [], refetch: refetchFiles } = useGetProjectFiles(Number(projectId));

  const title = project?.projectName || '프로젝트 이름';
  const desc = project?.description || '프로젝트 설명';
  const day = formatLocalDateTime(project?.creationDate);

  const getTaskColor = (taskId) => {
    if (!taskId) return TASK_COLOR_PALETTE[0];
    return TASK_COLOR_PALETTE[Math.abs(Number(taskId)) % TASK_COLOR_PALETTE.length];
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completed = tasks.filter((t) => t.status === 'DONE').length;
    return { total, todo, inProgress, completed };
  }, [tasks]);

  const sortedMembers = useMemo(() => {
    const myMember = members.find((m) => m.username === myUsername);
    const others = members.filter((m) => m.username !== myUsername);
    return myMember ? [myMember, ...others] : others;
  }, [members, myUsername]);

  const isLeader = useMemo(() => {
    const myMember = members.find((m) => m.username === myUsername);
    return myMember?.role === 'LEADER';
  }, [members, myUsername]);

  const tasksByMember = useMemo(() => {
    const map = { UNASSIGNED: [] };
    sortedMembers.forEach((m) => (map[m.username] = []));
    tasks.forEach((t) => {
      const key = t.assigneeId || 'UNASSIGNED';
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks, sortedMembers]);

  const getEffectiveFilter = (laneKey) => {
    if (taskStatusFilter !== 'ALL') return taskStatusFilter;
    return memberStatusFilters[laneKey] || 'ALL';
  };

  const getFilteredTaskList = (taskList, laneKey = 'GLOBAL') => {
    const activeFilter = getEffectiveFilter(laneKey);
    if (activeFilter === 'ALL') return taskList;
    return taskList.filter((task) => task.status === activeFilter);
  };

  const applyMemberFilter = (laneKey, filterKey) => {
    setMemberStatusFilters((prev) => ({ ...prev, [laneKey]: filterKey }));
  };

  const filteredUnassignedTasks = sortTasksForLane(
    getFilteredTaskList(tasksByMember.UNASSIGNED || [], 'UNASSIGNED'),
  );

  const isGlobalFilterForced = taskStatusFilter !== 'ALL';

  const FilterBadgeRow = ({ activeKey, onSelect, disabled = false }) => (
    <div className="flex flex-wrap items-center gap-2">
      {TASK_FILTER_OPTIONS.map((option) => {
        const isActive = activeKey === option.key;
        return (
          <button
            key={option.key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.key)}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide transition-all ${
              isActive
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:bg-muted'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  const onLaneMouseDown = (laneKey, event) => {
    const container = event.currentTarget;
    setDragState({
      laneKey,
      startX: event.pageX,
      startScrollLeft: container.scrollLeft,
    });
  };

  const onLaneMouseMove = (laneKey, event) => {
    if (dragState.laneKey !== laneKey) return;
    event.preventDefault();
    const container = event.currentTarget;
    const deltaX = event.pageX - dragState.startX;
    container.scrollLeft = dragState.startScrollLeft - deltaX;
  };

  const endLaneDrag = () => {
    if (!dragState.laneKey) return;
    setDragState({ laneKey: null, startX: 0, startScrollLeft: 0 });
  };

  const timelineMembers = useMemo(() => {
    return sortedMembers.map((m) => ({
      username: m.username,
      displayName: m.nickname || m.username,
      role: m.role,
    }));
  }, [sortedMembers]);

  const timelineTasks = useMemo(() => {
    return tasks.map((t) => ({
      ...t,
      id: t.taskId,
      startDate: t.startDate || t.createdDate,
      dueDate: t.dueDate || t.updatedDate,
      color: getTaskColor(t.taskId),
      tags: Array.isArray(t.tags) ? t.tags : [],
    }));
  }, [tasks]);

  const aiContext = useMemo(
    () => ({
      project: { projectId, title, description: desc, startDate: project?.createdDate || '' },
      summary: stats,
      members: members.map((m) => ({ name: m.username, role: m.role })),
      tasks: tasks.map((t) => ({
        taskId: t.taskId,
        title: t.title,
        status: t.status,
        assigneeId: t.assigneeId,
        dueDate: t.dueDate,
        createdDate: t.createdDate,
        updatedDate: t.updatedDate,
      })),
      requester: { username: myUsername },
    }),
    [projectId, project, members, tasks, myUsername, title, desc, stats],
  );

  const handleGenerateReport = async () => {
    try {
      const report = await generateProjectReport(projectId);
      const now = new Date();
      const reportId = `${now.getTime()}`;
      const entry = {
        id: reportId,
        label: getWeekLabel(now),
        createdAt: now.toISOString(),
        report,
      };
      setProjectReport(report);
      setActiveReportId(reportId);
      setReportHistory((prev) => [entry, ...prev].slice(0, 12));
      setShowPreview(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectReport = (reportId) => {
    const target = reportHistory.find((item) => item.id === reportId);
    if (!target) return;
    setActiveReportId(reportId);
    setProjectReport(target.report);
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchProject(),
        refetchMembers(),
        refetchInvitees(),
        refetchTasks(),
        refetchFiles(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!selectedTask) return;
    const stillExists = tasks.some(
      (taskItem) => Number(taskItem.taskId) === Number(selectedTask.taskId),
    );
    if (!stillExists) {
      setSelectedTask(null);
    }
  }, [selectedTask, tasks]);

  if (isProjectLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="프로젝트 데이터를 불러오는 중..." />
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <NotFoundState
        message={getErrorMessage(projectError, '접근 권한이 없거나 프로젝트가 존재하지 않습니다.')}
      />
    );
  }

  return (
    <div className="animate-in fade-in min-h-screen bg-background pb-20 duration-700">
      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Header />
        </div>
      </div>

      {/* Hero Section */}
      <div className="border-b border-border bg-background shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
              {desc}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:gap-3 sm:pt-4 sm:text-[11px]">
              <span className="rounded-lg border border-border bg-muted px-2 py-1">
                Created: {day}
              </span>
              <span
                className="hidden h-1.5 w-1.5 rounded-full bg-blue-500 sm:inline-block"
                aria-hidden
              />
              <span>{members.length} Team Members</span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              className="rounded-2xl border border-border bg-background px-5 py-3 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted active:scale-95 sm:px-6"
              onClick={handleBack}
            >
              나가기
            </button>
            <button
              type="button"
              onClick={openCreateTask}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95 sm:px-6"
            >
              + 새 작업 추가
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-14 z-40 border-b border-border bg-background/95 backdrop-blur-sm sm:top-[73px]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-wrap gap-2">
            {[
              { id: 'project', label: '보드' },
              { id: 'timeline', label: '타임라인' },
              { id: 'file', label: '파일' },
              { id: 'ai-report', label: 'AI 리포트', isAi: true },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => openMainTab(tab.id)}
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
                  topTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-blue-100'
                    : tab.isAi
                      ? 'border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15'
                      : 'border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted'
                }`}
              >
                {tab.isAi && <IconRobot size={16} className="sm:h-[18px] sm:w-[18px]" />}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              className="rounded-2xl border border-border bg-card p-3 text-muted-foreground shadow-sm transition-all hover:bg-muted active:scale-90"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              title="새로고침"
            >
              {isRefreshing ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              ) : (
                <IconRefresh size={22} />
              )}
            </button>
            <button
              className="rounded-2xl border border-border bg-card p-3 text-muted-foreground shadow-sm transition-all hover:bg-muted active:scale-90"
              onClick={() => setIsMemberModalOpen(true)}
              title="멤버 관리"
            >
              <IconUserAdd size={22} />
            </button>

            <button
              className={`rounded-2xl border p-3 shadow-sm transition-all active:scale-90 ${
                topTab === 'settings'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
              onClick={() => openMainTab('settings')}
              title="설정"
            >
              <IconSettings size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Suspense
          fallback={
            <div className="py-20">
              <LoadingSpinner size="lg" label="컴포넌트를 준비 중입니다..." />
            </div>
          }
        >
          {topTab === 'project' && (
            <div className="space-y-10">
              <TaskSummaryCard
                stats={stats}
                activeFilter={taskStatusFilter}
                onFilterChange={setTaskStatusFilter}
              />

              {isBoardBootstrapping ? (
                <div className="py-20">
                  <LoadingSpinner size="lg" label="작업 보드를 불러오는 중..." />
                </div>
              ) : isTasksError ? (
                <ErrorState
                  title="작업 목록을 불러오지 못했습니다"
                  message={getErrorMessage(tasksError, '알 수 없는 오류가 발생했습니다.')}
                  onRetry={() => window.location.reload()}
                />
              ) : tasks.length === 0 ? (
                <EmptyState
                  title="작업이 없습니다"
                  actionLabel="+ 새 작업 추가"
                  onAction={openCreateTask}
                />
              ) : sortedMembers.length === 0 ? (
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="border-b border-border bg-muted/40 px-8 py-5">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">작업 카드</h3>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      멤버 정보를 불러오는 중이거나 동기화가 지연되어, 우선 전체 카드를 표시합니다.
                    </p>
                  </div>
                  <div className="p-10">
                    <div
                      className="hide-scrollbar flex cursor-grab gap-6 overflow-x-auto pb-2 active:cursor-grabbing"
                      onMouseDown={(event) => onLaneMouseDown('FALLBACK', event)}
                      onMouseMove={(event) => onLaneMouseMove('FALLBACK', event)}
                      onMouseUp={endLaneDrag}
                      onMouseLeave={endLaneDrag}
                    >
                      {sortTasksForLane(getFilteredTaskList(tasks, 'FALLBACK')).map((task) => (
                        <div
                          key={task.taskId}
                          className="w-[min(320px,calc(100vw-2rem))] max-w-[320px] flex-shrink-0 sm:w-[320px]"
                        >
                          <TaskCard task={task} onClick={() => openTask(task)} />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ) : (
                <>
                  {sortedMembers.map((member) => {
                    const memberAllTasks = tasksByMember[member.username] || [];
                    const taskList = sortTasksForLane(
                      getFilteredTaskList(memberAllTasks, member.username),
                    );
                    const totalCount = memberAllTasks.length;
                    const doneCount = memberAllTasks.filter((t) => t.status === 'DONE').length;
                    const laneFilterKey = getEffectiveFilter(member.username);

                    return (
                      <section
                        key={member.username}
                        className="animate-in slide-in-from-bottom-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm duration-500"
                      >
                        <div className="relative flex items-center justify-between border-b border-border bg-muted/40 px-8 py-5">
                          <div className="flex items-center gap-4">
                            <UserProfileImg name={member.nickname} profileImg={member.profileImg} />
                            <div>
                              <h3 className="text-xl font-bold tracking-tight text-foreground">
                                {member.nickname}
                              </h3>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                @{member.username} · {member.role}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-10">
                            <div className="text-center">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Total
                              </p>
                              <p className="text-lg font-bold text-foreground">{totalCount}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
                                Done
                              </p>
                              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {doneCount}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-10">
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <FilterBadgeRow
                              activeKey={laneFilterKey}
                              disabled={isGlobalFilterForced}
                              onSelect={(filterKey) =>
                                applyMemberFilter(member.username, filterKey)
                              }
                            />
                            {isGlobalFilterForced && (
                              <p className="text-[10px] font-semibold text-muted-foreground">
                                전역 필터 적용 중
                              </p>
                            )}
                          </div>
                          {taskList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/25 py-16 text-center">
                              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted shadow-inner">
                                <IconCheckbox size={32} className="text-muted-foreground/50" />
                              </div>
                              <p className="text-sm font-semibold italic text-muted-foreground">
                                아직 할당된 작업이 없습니다.
                              </p>
                              <button
                                onClick={() => {
                                  setDefaultAssigneeId(member.username);
                                  setIsCreateTaskModalOpen(true);
                                }}
                                className="mt-4 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline"
                              >
                                + Assign New Task
                              </button>
                            </div>
                          ) : (
                            <div
                              className="hide-scrollbar flex cursor-grab gap-6 overflow-x-auto pb-2 active:cursor-grabbing"
                              onMouseDown={(event) => onLaneMouseDown(member.username, event)}
                              onMouseMove={(event) => onLaneMouseMove(member.username, event)}
                              onMouseUp={endLaneDrag}
                              onMouseLeave={endLaneDrag}
                            >
                              {taskList.map((task) => (
                                <div
                                  key={task.taskId}
                                  className="w-[min(320px,calc(100vw-2rem))] max-w-[320px] flex-shrink-0 sm:w-[320px]"
                                >
                                  <TaskCard task={task} onClick={() => openTask(task)} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </section>
                    );
                  })}

                  {/* Unassigned Tasks */}
                  <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                          <IconUnassigned size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold tracking-tight text-foreground">
                            담당자 없음
                          </h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            배정 대기 중인 리스트
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-10">
                      {filteredUnassignedTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/25 py-16 text-center">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted shadow-inner">
                            <IconCheckbox size={32} className="text-muted-foreground/50" />
                          </div>
                          <p className="text-sm font-semibold italic text-muted-foreground">
                            모든 작업이 배정되었습니다.
                          </p>
                        </div>
                      ) : (
                        <div
                          className="hide-scrollbar flex cursor-grab gap-6 overflow-x-auto pb-2 active:cursor-grabbing"
                          onMouseDown={(event) => onLaneMouseDown('UNASSIGNED', event)}
                          onMouseMove={(event) => onLaneMouseMove('UNASSIGNED', event)}
                          onMouseUp={endLaneDrag}
                          onMouseLeave={endLaneDrag}
                        >
                          {filteredUnassignedTasks.map((task) => (
                            <div
                              key={task.taskId}
                              className="w-[min(320px,calc(100vw-2rem))] max-w-[320px] flex-shrink-0 sm:w-[320px]"
                            >
                              <TaskCard task={task} onClick={() => openTask(task)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {topTab === 'timeline' && (
            <TaskTimeline
              tasks={timelineTasks}
              members={timelineMembers}
              onTaskClick={(task) => {
                const originalTask = tasks.find((item) => item.taskId === task.id);
                if (originalTask) openTask(originalTask);
              }}
            />
          )}

          {topTab === 'file' && (
            <FilePanel rawFiles={files} tasks={tasks} projectId={Number(projectId)} />
          )}

          {topTab === 'ai-report' && (
            <ProjectReportView
              report={projectReport}
              isLoading={isReportLoading}
              onGenerate={handleGenerateReport}
              context={aiContext}
              reportHistory={reportHistory}
              activeReportId={activeReportId}
              onSelectReport={handleSelectReport}
              previewMode={showPreview}
            />
          )}

          {topTab === 'settings' && (
            <ProjectConfigPanel
              isLeader={isLeader}
              myUsername={myUsername}
              project={project}
              projectId={projectId}
              members={sortedMembers}
              pendingInvites={pendingInvites}
              onBack={() => setTopTab('project')}
            />
          )}
        </Suspense>
      </div>

      {/* Modals with Suspense */}
      <Suspense fallback={null}>
        {isCreateTaskModalOpen && (
          <CreateTaskModal
            projectId={projectId}
            isOpen={isCreateTaskModalOpen}
            onClose={() => setIsCreateTaskModalOpen(false)}
            members={members}
            defaultAssigneeId={defaultAssigneeId}
          />
        )}

        {selectedTask && (
          <TaskModal
            task={{
              ...selectedTask,
              tags: Array.isArray(selectedTask.tags) ? selectedTask.tags : [],
            }}
            onClose={closeTask}
            files={files.filter((f) => f.taskId === selectedTask.taskId)}
            members={members}
            myUserName={myUsername}
            projectId={projectId}
            leaderName={members.find((m) => m.role === 'LEADER')?.nickname}
          />
        )}

        {isMemberModalOpen && (
          <InviteMembersModal
            projectId={projectId}
            members={sortedMembers}
            myUsername={myUsername}
            pendingInvites={pendingInvites}
            onClose={() => setIsMemberModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
