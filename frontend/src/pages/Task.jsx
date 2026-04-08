import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { askProjectAssistant } from '@/features/ai/api/askProjectAssistant.js';
// import { taskStatus } from '@/features/tasks/types/task.js';
import { useGetBoards } from '@/features/boards/api/useGetBoards.js';
import { useGetInvitees } from '@/features/invitations/api/useGetInvitees.js';
import { useGetMemberList } from '@/features/members/api/useGetMemberList.js';
import { useGetProjectDetails } from '@/features/projects/api/useGetProjectDetails.js';
import { useGetTaskList } from '@/features/tasks/api/useGetTaskList.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import FilePanel from '@/features/files/components/FilePanel.jsx';
import ProjectMemberModal from '@/features/members/components/MemberManagementModal.jsx';
import ProjectAdminPanel from '@/features/projects/components/ProjectAdminPanel.jsx';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal.jsx';
import TaskCard from '@/features/tasks/components/TaskCard.jsx';
import TaskModal from '@/features/tasks/components/TaskModal.jsx';
import TaskTimeline from '@/features/tasks/components/TaskTimeline.jsx';
import { IconSettings, IconTrash, IconUserAdd } from '@/shared/assets/icons.js';
import Header from '@/shared/components/Header.jsx';
import ProjectTrashPanel from '../features/projects/components/ProjectTrashPanel.jsx';

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

const AI_EXAMPLE_QUESTIONS = [
  '이 프로젝트 마감일 언제야?',
  '진행중인 작업 몇 개야?',
  '내가 맡은 작업 뭐야?',
];

export default function Task() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const myUsername = user?.username || '';

  // const [activeBoardId, setActiveBoardId] = useState(null);
  const [defaultAssigneeName, setDefaultAssigneeName] = useState(myUsername);
  const [selectedTask, setSelectedTask] = useState(null);
  const [topTab, setTopTab] = useState('project');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const openTask = (task) => setSelectedTask(task);
  const closeTask = () => setSelectedTask(null);
  const openCreateTask = () => setIsCreateTaskModalOpen(true);

  const handleBack = () => {
    navigate('/dashboard');
  };

  /** @param {'project' | 'timeline' | 'file'} tabKey */
  const openMainTab = (tabKey) => {
    setTopTab(tabKey);
    navigate(`/project/${id}`);
  };

  const { data: project = null } = useGetProjectDetails(id);
  const { data: members = [] } = useGetMemberList(id);
  const { data: pendingInvites = [] } = useGetInvitees(id);
  // const { data: boards = [] } = useGetBoards(id);
  const { data: tasks } = useGetTaskList(Number(id));

  // const tasks = tasks?.allTasks || [];

  const title = project?.projectName || '프로젝트 이름';
  const desc = project?.description || '프로젝트 설명';
  const day = project?.createdDate ? project.createdDate.slice(0, 10) : '-';

  const getTaskColor = (taskId) => {
    if (!taskId) return TASK_COLOR_PALETTE[0];
    return TASK_COLOR_PALETTE[Math.abs(Number(taskId)) % TASK_COLOR_PALETTE.length];
  };

  const normalizeTaskForTimeline = (task) => {
    const createdBase =
      task.createdDate || task.updatedDate || new Date().toISOString().split('T')[0];

    return {
      ...task,
      id: task.taskId,
      title: task.title || '',
      assignee: task.assignee || '',
      startDate: task.startDate || createdBase,
      dueDate: task.dueDate || task.startDate || createdBase,
      createdDate: createdBase,
      color: task.color || getTaskColor(task.taskId),
      tags: Array.isArray(task.tags) ? task.tags : [],
      notes: task.notes || '',
    };
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completed = tasks.filter((t) => t.status === 'DONE').length;

    return { total, todo, inProgress, completed };
  }, [tasks]);

  const summaryCards = useMemo(
    () => [
      {
        label: '전체 작업',
        value: stats.total,
        icon: '📘',
        cardClass: 'border-[#DEE7FF] bg-white',
        iconWrapClass: 'bg-[#EEF2FF]',
      },
      {
        label: '대기',
        value: stats.todo,
        icon: '⏳',
        cardClass: 'border-gray-200 bg-white',
        iconWrapClass: 'bg-gray-100',
      },
      {
        label: '진행중',
        value: stats.inProgress,
        icon: '🏃',
        cardClass: 'border-[#F1E9C9] bg-white',
        iconWrapClass: 'bg-[#FBF2D4]',
      },
      {
        label: '완료',
        value: stats.completed,
        icon: '✅',
        cardClass: 'border-[#D8EEDC] bg-white',
        iconWrapClass: 'bg-[#DFF3E2]',
      },
    ],
    [stats],
  );

  const sortedMembers = useMemo(() => {
    const myMember = members.find((m) => m.username === myUsername);
    const others = members.filter((m) => m.username !== myUsername);
    return myMember ? [myMember, ...others] : others;
  }, [members, myUsername]);

  const myProjectRole = useMemo(() => {
    const myMember = members.find((member) => member.username === myUsername);
    return String(myMember?.role || 'member').toLowerCase();
  }, [members, myUsername]);

  const isLeader = myProjectRole === 'leader';

  // useEffect(() => {
  //   if (boards.length > 0 && activeBoardId === null) {
  //     setActiveBoardId(boards[0].boardId);
  //   }
  // }, [boards, activeBoardId]);

  useEffect(() => {
    if (location.pathname.endsWith('/admin')) {
      setTopTab('settings');
      return;
    }

    if (location.pathname.endsWith('/trash')) {
      setTopTab('trash');
      return;
    }

    if (topTab === 'settings' || topTab === 'trash') {
      setTopTab('project');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isLeader && topTab === 'settings') {
      setTopTab('project');
    }
  }, [isLeader, topTab]);

  useEffect(() => {
    if (!isLeader && location.pathname.endsWith('/admin')) {
      navigate(`/project/${id}`, { replace: true });
    }
  }, [isLeader, location.pathname, navigate, id]);

  const tasksByMember = useMemo(() => {
    const map = {};

    sortedMembers.forEach((m) => {
      map[m.username] = [];
    });

    tasks.forEach((t) => {
      if (!map[t.assignee]) map[t.assignee] = [];
      map[t.assignee].push(t);
    });

    return map;
  }, [tasks, sortedMembers]);

  const timelineMembers = useMemo(() => {
    return sortedMembers.map((member) => ({
      name: member.username,
      displayName: member.nickname || member.username,
      role: member.role,
    }));
  }, [sortedMembers]);

  const timelineTasks = useMemo(() => {
    return tasks.map(normalizeTaskForTimeline);
  }, [tasks]);

  const aiContext = useMemo(() => {
    const validDueDates = tasks
      .map((task) => task?.dueDate)
      .filter(Boolean)
      .sort();

    const nearestDueDate = validDueDates[0] || '';
    const latestDueDate = validDueDates[validDueDates.length - 1] || '';

    return {
      project: {
        projectId: id || '',
        title: project?.projectName || '',
        description: project?.description || '',
        startDate: project?.createdDate || '',
      },
      summary: {
        totalTaskCount: tasks.length,
        todoCount: tasks.filter((task) => task.status === 'TODO').length,
        inProgressCount: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
        doneCount: tasks.filter((task) => task.status === 'DONE').length,
        nearestDueDate,
        latestDueDate,
      },
      members: members.map((member) => ({
        name: member.username || member.nickname || '',
        role: member.role || '',
      })),
      tasks: tasks.map((task) => ({
        title: task.title || '',
        assignee: task.assignee || '',
        status: task.status || '',
        dueDate: task.dueDate || '',
        tags: Array.isArray(task.tags) ? task.tags : [],
      })),
      requester: {
        username: myUsername,
      },
    };
  }, [id, project, members, tasks, myUsername]);

  const handleAskProjectAI = async () => {
    const trimmedQuestion = aiQuestion.trim();
    if (!trimmedQuestion || aiLoading) return;

    setAiLoading(true);
    setAiError('');
    setAiAnswer('');

    try {
      const answer = await askProjectAssistant(trimmedQuestion, aiContext);
      setAiAnswer(answer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '미룸 AI 응답을 불러오지 못했습니다.';
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  };

  /** @param {import('react').KeyboardEvent<HTMLTextAreaElement>} event */
  const handleAiQuestionKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAskProjectAI();
    }
  };

  const deletedTasks = useMemo(() => {
    // TODO: 삭제된 작업 카드 조회 API 연동
    return /** @type {{ id?: string | number; title?: string; assignee?: string; deletedAt?: string }[]} */ ([]);
  }, []);

  const deletedFiles = useMemo(() => {
    // TODO: 삭제된 파일 조회 API 연동
    return /** @type {{ id?: string | number; filename?: string; owner?: string; deletedAt?: string }[]} */ ([]);
  }, []);

  const deletedCards = deletedTasks;

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative z-50 border-b border-gray-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-6">
            <Header />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">프로젝트 정보를 불러올 수 없습니다.</h1>
            <button
              onClick={handleBack}
              className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              ← 전체 프로젝트로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6">
          <Header />
        </div>
      </div>

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
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50"
              onClick={handleBack}
            >
              나가기
            </button>

            <button
              onClick={openCreateTask}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700"
            >
              + 새 작업
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className={`flex min-h-[84px] items-center justify-between rounded-xl border px-5 py-4 shadow-sm ${card.cardClass}`}
              >
                <div className="flex min-w-0 items-center gap-3 pr-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base ${card.iconWrapClass}`}
                  >
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  <span className="truncate text-[14px] font-medium text-[#8A93A2]">
                    {card.label}
                  </span>
                </div>

                <span className="ml-auto text-[26px] font-semibold text-[#111827]">
                  {card.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl items-start justify-between px-6 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openMainTab('project')}
              className={`cursor-pointer rounded-lg border px-4 py-2 transition ${
                topTab === 'project'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              프로젝트
            </button>

            <button
              type="button"
              onClick={() => openMainTab('timeline')}
              className={`cursor-pointer rounded-lg border px-4 py-2 transition ${
                topTab === 'timeline'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              타임라인
            </button>

            <button
              type="button"
              onClick={() => openMainTab('file')}
              className={`cursor-pointer rounded-lg border px-4 py-2 transition ${
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
              type="button"
              className={`cursor-pointer rounded-lg border px-4 py-2 transition ${
                isAiOpen
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsAiOpen((prev) => !prev)}
            >
              <span className="flex flex-col items-center justify-center text-[11px] font-semibold leading-none">
                <span>미룸</span>
                <span>AI</span>
              </span>
            </button>

            <button
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50"
              onClick={() => setIsMemberModalOpen(!isMemberModalOpen)}
            >
              <IconUserAdd /> 멤버
            </button>

            {isMemberModalOpen && (
              <ProjectMemberModal
                projectId={id}
                members={sortedMembers || []}
                myUsername={myUsername}
                pendingInvites={pendingInvites || []}
                onClose={() => setIsMemberModalOpen(false)}
              />
            )}

            {isLeader ? (
              <button
                className={`cursor-pointer rounded-lg border px-4 py-2 transition ${
                  topTab === 'settings'
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setTopTab('settings');
                  navigate(`/project/${id}/admin`);
                }}
              >
                <IconSettings /> 설정
              </button>
            ) : (
              <button
                className={`cursor-pointer rounded-lg border px-4 py-2 transition ${
                  topTab === 'trash'
                    ? 'border-gray-300 bg-gray-100 text-gray-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setTopTab('trash');
                  navigate(`/project/${id}/trash`);
                }}
              >
                <IconTrash /> 휴지통
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {isAiOpen && (
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">미룸 AI</h3>
              <p className="mt-1 text-sm text-gray-600">
                프로젝트 정보, 작업 상태, 담당자 기준으로 질문할 수 있습니다.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {AI_EXAMPLE_QUESTIONS.map((exampleQuestion) => (
                <button
                  key={exampleQuestion}
                  type="button"
                  onClick={() => setAiQuestion(exampleQuestion)}
                  className="cursor-pointer rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700 transition hover:bg-blue-100"
                >
                  {exampleQuestion}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <textarea
                value={aiQuestion}
                onChange={(event) => setAiQuestion(event.target.value)}
                onKeyDown={handleAiQuestionKeyDown}
                placeholder="예: user1이 맡은 작업 뭐야?"
                className="min-h-[88px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />

              <button
                type="button"
                onClick={handleAskProjectAI}
                disabled={aiLoading || !aiQuestion.trim()}
                className="w-full cursor-pointer whitespace-nowrap rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 md:w-auto md:min-w-[112px] md:shrink-0"
              >
                {aiLoading ? '답변 생성 중...' : '질문하기'}
              </button>
            </div>

            {aiLoading && (
              <p className="mt-3 text-sm text-blue-600">미룸 AI가 답변을 준비하고 있습니다...</p>
            )}
            {aiError && <p className="mt-3 text-sm text-red-500">{aiError}</p>}

            {aiAnswer && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">AI 답변</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{aiAnswer}</p>
              </div>
            )}
          </div>
        )}

        {topTab === 'project' && (
          <div className="space-y-6">
            {sortedMembers.map((member) => {
              const list = tasksByMember[member.username] || [];
              const doneCount = list.filter((t) => t.status === 'DONE').length;

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
                        <div className="text-lg font-semibold text-gray-900">{member.username}</div>
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
                            task={{
                              ...task,
                              tags: Array.isArray(task.tags) ? task.tags : [],
                            }}
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

        {topTab === 'file' && <FilePanel projectId={Number(id)} />}

        {topTab === 'timeline' && (
          <TaskTimeline
            tasks={timelineTasks}
            teamMembers={timelineMembers}
            onTaskClick={(task) => {
              const originalTask = tasks.find((item) => item.taskId === task.id);
              if (originalTask) openTask(originalTask);
            }}
          />
        )}

        {topTab === 'trash' && (
          <ProjectTrashPanel deletedTasks={deletedTasks} deletedFiles={deletedFiles} />
        )}

        {topTab === 'settings' &&
          (isLeader ? (
            <ProjectAdminPanel
              project={project}
              projectId={id}
              members={sortedMembers}
              pendingInvites={pendingInvites}
              deletedCards={deletedCards}
              taskStats={stats}
              onBack={() => setTopTab('project')}
            />
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm">
              관리자 페이지는 리더만 접근할 수 있습니다.
            </div>
          ))}
      </div>

      <CreateTaskModal
        projectId={id}
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        members={members}
        defaultAssigneeName={defaultAssigneeName}
        // boardId={activeBoardId}
      />

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
