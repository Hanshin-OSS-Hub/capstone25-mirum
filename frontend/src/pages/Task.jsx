import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskStatus } from '@/features/tasks/types/task.js';
import { useGetBoards } from '@/features/boards/api/useGetBoards.js';
import { useGetInvitees } from '@/features/invitations/api/useGetInvitees.js';
import { useGetMemberList } from '@/features/members/api/useGetMemberList.js';
import { useGetProjectDetails } from '@/features/projects/api/useGetProjectDetails.js';
import { useGetTaskList } from '@/features/tasks/api/useGetTaskList.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import ProjectMemberModal from '@/features/members/components/MemberManagementModal.jsx';
import ProjectUpdateModal from '@/features/projects/components/ProjectUpdateModal.jsx';
import ProjectConfigMenu from '@/features/projects/components/projectConfigMenu.jsx';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal.jsx';
import TaskCard from '@/features/tasks/components/TaskCard.jsx';
import TaskModal from '@/features/tasks/components/TaskModal.jsx';
import TaskTimeline from '@/features/tasks/components/TaskTimeline.jsx';
import { IconSettings, IconUserAdd } from '@/shared/assets/icons.js';
import Header from '@/shared/components/Header.jsx';
import SummaryCard from '@/shared/components/SummaryCard.jsx';

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

export default function Task() {
  const { id } = useParams();
  const { user } = useAuth();
  const myUsername = user?.username || '';
  const navigate = useNavigate();

  const [activeBoardId, setActiveBoardId] = useState(null);
  const [defaultAssigneeName, setDefaultAssigneeName] = useState(myUsername);
  const [selectedTask, setSelectedTask] = useState(null);
  const [topTab, setTopTab] = useState('project');

  const openTask = (task) => setSelectedTask(task);
  const closeTask = () => setSelectedTask(null);

  const { data: project = [], isLoading, isError, error } = useGetProjectDetails(id);
  const { data: members = [] } = useGetMemberList(id);
  const { data: pendingInvites = [] } = useGetInvitees(id);
  const { data: boards = [] } = useGetBoards(id);
  const {
    data: tasks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTaskList(activeBoardId);

  const taskData = tasks?.allTasks || [];

  const title = project?.projectName || '프로젝트 이름';
  const desc = project?.description || '프로젝트 설명';
  const day = project?.creationDate ? project.creationDate.slice(0, 10) : '-';

  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const openCreateTask = () => setIsCreateTaskModalOpen(true);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getTaskColor = (taskId) => {
    if (!taskId) return TASK_COLOR_PALETTE[0];
    return TASK_COLOR_PALETTE[Math.abs(Number(taskId)) % TASK_COLOR_PALETTE.length];
  };

  const normalizeTaskForTimeline = (task) => {
    const createdBase =
        task.creationDate ||
        task.updateDate ||
        new Date().toISOString().split('T')[0];

    return {
      ...task,
      id: task.taskId,
      title: task.title || '',
      assignee: task.assignee || '',
      startDate: task.startDate || createdBase,
      dueDate: task.dueDate || task.startDate || createdBase,
      creationDate: createdBase,
      color: task.color || getTaskColor(task.taskId),
      tags: Array.isArray(task.tags) ? task.tags : [],
      notes: task.notes || '',
    };
  };

  const stats = useMemo(() => {
    const total = taskData.length;
    const todo = taskData.filter((t) => t.status === taskStatus.todo).length;
    const inProgress = taskData.filter((t) => t.status === taskStatus.inProgress).length;
    const completed = taskData.filter((t) => t.status === taskStatus.done).length;
    return { total, todo, inProgress, completed };
  }, [taskData]);

  const sortedMembers = useMemo(() => {
    const myMember = members.find((m) => m.username === myUsername);
    const others = members.filter((m) => m.username !== myUsername);
    return myMember ? [myMember, ...others] : others;
  }, [members, myUsername]);

  useEffect(() => {
    if (boards.length > 0 && activeBoardId === null) {
      setActiveBoardId(boards[0].boardId);
    }
  }, [boards, activeBoardId]);

  const tasksByMember = useMemo(() => {
    const map = {};
    sortedMembers.forEach((m) => {
      map[m.username] = [];
    });

    taskData.forEach((t) => {
      if (!map[t.assignee]) map[t.assignee] = [];
      map[t.assignee].push(t);
    });

    return map;
  }, [taskData, sortedMembers]);

  const timelineMembers = useMemo(() => {
    return sortedMembers.map((member) => ({
      // id: member.id,
      name: member.username,
      displayName: member.nickname || member.username,
      role: member.role,
    }));
  }, [sortedMembers]);

  const timelineTasks = useMemo(() => {
    return taskData.map(normalizeTaskForTimeline);
  }, [taskData]);

  if (!project) {
    return (
        <div className="pj-root">
          <header className="pj-top-bar">
            <div className="logo-area" style={{ cursor: 'pointer' }} onClick={handleBack}>
              <div className="logo-icon">M</div>
              <span className="logo-text">Mirum</span>
            </div>

            <div className="top-right">
              <button className="icon-button" onClick={handleBack}>
                ← 전체 프로젝트
              </button>
            </div>
          </header>

          <main className="pj-main">
            <h1 className="pj-title">프로젝트 정보를 불러올 수 없습니다.</h1>
          </main>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="relative z-50 border-b border-gray-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-6">
            <Header />
          </div>
        </div>

        {/* Header */}
        <div className="bg-white">
          <div className="mx-auto flex max-w-7xl items-start justify-between px-6 py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <ul className="mt-1 text-sm text-gray-500">
                <li>{desc}</li>
                <li>
                  시작일: {day} · 프로젝트 ID: {id}
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <button
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={handleBack}
              >
                나가기
              </button>
              <button
                  onClick={openCreateTask}
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
              >
                + 새 작업
              </button>
            </div>
          </div>
        </div>

        {/* Top Tabs / Actions */}
        <div className="bg-white">
          <div className="mx-auto flex max-w-7xl items-start justify-between px-6 py-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                  type="button"
                  onClick={() => setTopTab('project')}
                  className={`cursor-pointer rounded-lg border px-4 py-2 ${
                      topTab === 'project'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                프로젝트
              </button>

              <button
                  type="button"
                  onClick={() => setTopTab('timeline')}
                  className={`cursor-pointer rounded-lg border px-4 py-2 ${
                      topTab === 'timeline'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                타임라인
              </button>

              <button
                  type="button"
                  onClick={() => setTopTab('file')}
                  className={`cursor-pointer rounded-lg border px-4 py-2 ${
                      topTab === 'file'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                파일
              </button>
            </div>

            <div className="relative flex items-center gap-3">
              <button
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMemberModalOpen(!isMemberModalOpen)}
              >
                <IconUserAdd /> 멤버
              </button>

              {isMemberModalOpen && project && (
                  <ProjectMemberModal
                      projectId={id}
                      members={sortedMembers || []}
                      myUsername={myUsername}
                      pendingInvites={pendingInvites || []}
                      onClose={() => setIsMemberModalOpen(false)}
                  />
              )}

              <button
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsConfigMenuOpen(!isConfigMenuOpen)}
              >
                <IconSettings /> 설정
              </button>

              {isConfigMenuOpen && (
                  <ProjectConfigMenu
                      projectId={id}
                      setIsConfigMenuOpen={setIsConfigMenuOpen}
                      setIsUpdateModalOpen={setIsUpdateModalOpen}
                      setIsMemberModalOpen={setIsMemberModalOpen}
                  />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard title="전체 작업" value={stats.total} />
            <SummaryCard title="대기" value={stats.todo} />
            <SummaryCard title="진행중" value={stats.inProgress} />
            <SummaryCard title="완료" value={stats.completed} />
          </div>

          {/* Project */}
          {topTab === 'project' && (
              <div className="space-y-6">
                {sortedMembers.map((member) => {
                  const list = tasksByMember[member.username] || [];
                  const doneCount = list.filter((t) => t.status === taskStatus.done).length;

                  return (
                      <div
                          key={member.username}
                          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] font-semibold text-white">
                              {member.nickname?.slice(0, 1).toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <div className="text-lg font-semibold text-gray-900">
                                {member.username}
                              </div>
                              <div className="truncate text-sm text-gray-500">
                                {member.nickname} · {member.role}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-gray-600">
                              작업 <span className="font-semibold text-gray-900">{list.length}</span>개
                            </div>
                            <div className="text-green-700">
                              완료 <span className="font-semibold">{doneCount}</span>개
                            </div>
                          </div>
                        </div>

                        <div className="px-6 py-6">
                          {list.length === 0 ? (
                              <div className="flex h-44 flex-col items-center justify-center text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                  <i className="ri-checkbox-line text-xl text-gray-400"></i>
                                </div>

                                <p className="text-base text-gray-400">아직 할당된 작업이 없습니다.</p>

                                <button
                                    type="button"
                                    onClick={() => {
                                      setDefaultAssigneeName(member.username);
                                      setIsCreateTaskModalOpen(true);
                                    }}
                                    className="mt-3 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  새 작업 추가
                                </button>
                              </div>
                          ) : (
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {list.map((task) => (
                                    <TaskCard
                                        key={task.taskId}
                                        task={{ ...task, tags: Array.isArray(task.tags) ? task.tags : [] }}
                                        onClick={() => openTask(task)}
                                    />
                                ))}
                              </div>
                          )}
                        </div>
                      </div>
                  );
                })}
              </div>
          )}

          {/* File */}
          {topTab === 'file' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
                  >
                    전체
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs">
                  0
                </span>
                  </button>

                  <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                  >
                    폴더
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  0
                </span>
                  </button>

                  <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                  >
                    미디어
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  0
                </span>
                  </button>

                  <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                  >
                    문서
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  0
                </span>
                  </button>
                </div>

                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-gray-400">
                  파일 화면 자리
                </div>
              </div>
          )}

          {/* Timeline */}
          {topTab === 'timeline' && (
              <TaskTimeline
                  tasks={timelineTasks}
                  teamMembers={timelineMembers}
                  onTaskClick={(task) => {
                    const originalTask = taskData.find((item) => item.taskId === task.id);
                    if (originalTask) openTask(originalTask);
                  }}
              />
          )}
        </div>

        {/* Create */}
        <CreateTaskModal
            projectId={id}
            isOpen={isCreateTaskModalOpen}
            onClose={() => setIsCreateTaskModalOpen(false)}
            members={members}
            defaultAssigneeName={defaultAssigneeName}
            boardId={activeBoardId}
        />

        {/* Detail */}
        {selectedTask && (
            <TaskModal
                task={{
                  ...selectedTask,
                  tags: Array.isArray(selectedTask.tags) ? selectedTask.tags : [],
                }}
                onClose={closeTask}
                members={members}
                myUserName={myUsername}
            />
        )}
      </div>
  );
}