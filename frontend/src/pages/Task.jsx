import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { askProjectAssistant } from '@/features/ai/api/askProjectAssistant.js';
import { useGetProjectFiles } from '@/features/files/api/useGetProjectFiles.js';
import { useGetInvitees } from '@/features/invitations/api/useGetInvitees.js';
import { useGetMemberList } from '@/features/members/api/useGetMemberList.js';
import { useGetProjectDetails } from '@/features/projects/api/useGetProjectDetails.js';
import { useGetTaskList } from '@/features/tasks/api/useGetTaskList.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import FilePanel from '@/features/files/components/FilePanel.jsx';
import ProjectMemberModal from '@/features/members/components/ProjectInvitationModal.jsx';
import ProjectConfigPanel from '@/features/projects/components/ProjectConfigPanel.jsx';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal.jsx';
import TaskCard from '@/features/tasks/components/TaskCard.jsx';
import TaskModal from '@/features/tasks/components/TaskModal.jsx';
import TaskSummaryCard from '@/features/tasks/components/TaskSummaryCard.jsx';
import TaskTimeline from '@/features/tasks/components/TaskTimeline.jsx';
import { IconSettings, IconTrash, IconUserAdd } from '@/shared/assets/icons.js';
import Header from '@/shared/components/Header.jsx';
import UserProfileImg from '@/shared/components/userProfileImg.jsx';

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
  const { projectId } = useParams();
  // const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const myUsername = user?.username || '';

  // const [activeBoardId, setActiveBoardId] = useState(null);
  const [defaultAssigneeId, setDefaultAssigneeId] = useState(myUsername);
  const [selectedTask, setSelectedTask] = useState(null);
  const [topTab, setTopTab] = useState('project');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const openTask = (task) => setSelectedTask(task);
  const closeTask = () => setSelectedTask(null);

  // 상단 새 작업 버튼 클릭 시 기본 담당자를 로그인한 유저로 고정
  const openCreateTask = () => {
    setDefaultAssigneeId(myUsername);
    setIsCreateTaskModalOpen(true);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  /** @param {'project' | 'timeline' | 'file'} tabKey */
  const openMainTab = (tabKey) => {
    setTopTab(tabKey);
    navigate(`/project/${projectId}`);
  };

  const { data: project = null } = useGetProjectDetails(Number(projectId));
  const { data: members = [] } = useGetMemberList(Number(projectId), myUsername);
  const { data: pendingInvites = [] } = useGetInvitees(Number(projectId));
  const { data: tasks = [] } = useGetTaskList({ projectId: Number(projectId) });
  const { data: files = [] } = useGetProjectFiles(Number(projectId));

  const title = project?.projectName || '프로젝트 이름';
  const desc = project?.description || '프로젝트 설명';
  const day = project?.createdDate ? project.createdDate.slice(0, 10) : '-';

  const getTaskColor = (taskId) => {
    if (!taskId) return TASK_COLOR_PALETTE[0];
    return TASK_COLOR_PALETTE[Math.abs(Number(taskId)) % TASK_COLOR_PALETTE.length];
  };

  const normalizeTaskForTimeline = (task) => {
    // const createdBase =
    //   task.createdDate || task.updatedDate || new Date().toISOString().split('T')[0];

    return {
      ...task,
      id: task.taskId,
      title: task.title || '',
      assigneeId: task.assigneeId || '',
      assigneeName: task.assigneeName || '',
      startDate: task.startDate || null,
      dueDate: task.dueDate || null,
      createdDate: task.createdDate,
      color: getTaskColor(task.taskId),
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

  const sortedMembers = useMemo(() => {
    const myMember = members.find((m) => m.username === myUsername);
    const others = members.filter((m) => m.username !== myUsername);
    return myMember ? [myMember, ...others] : others;
  }, [members, myUsername]);

  const myProjectRole = useMemo(() => {
    const myMember = members.find((member) => member.username === myUsername);
    // role 값을 항상 대문자로 통일
    return String(myMember?.role || 'MEMBER').toUpperCase();
  }, [members, myUsername]);

  const isLeader = myProjectRole === 'LEADER';

  // useEffect(() => {
  //   if (location.pathname.endsWith('/admin')) {
  //     setTopTab('settings');
  //     return;
  //   }
  //
  //   if (location.pathname.endsWith('/trash')) {
  //     setTopTab('trash');
  //     return;
  //   }
  //
  //   if (topTab === 'settings' || topTab === 'trash') {
  //     setTopTab('project');
  //   }
  // }, [location.pathname]);

  // useEffect(() => {
  //   if (!isLeader && topTab === 'settings') {
  //     setTopTab('project');
  //   }
  // }, [isLeader, topTab]);

  // useEffect(() => {
  //   if (!isLeader && location.pathname.endsWith('/admin')) {
  //     navigate(`/project/${projectId}`, { replace: true });
  //   }
  // }, [isLeader, location.pathname, navigate, projectId]);

  const tasksByMember = useMemo(() => {
    const map = {};

    sortedMembers.forEach((m) => {
      map[m.username] = [];
    });
    // 담당자 없는 태스크를 담을 특수 버킷 추가
    map['UNASSIGNED'] = [];

    tasks.forEach((t) => {
      // assigneeId가 없으면 'UNASSIGNED' 버킷으로
      const key = t.assigneeId ? t.assigneeId : 'UNASSIGNED';
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });

    return map;
  }, [tasks, sortedMembers]);

  const timelineMembers = useMemo(() => {
    return sortedMembers.map((member) => ({
      username: member.username,
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
        projectId: projectId || '',
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
        assigneeId: task.assigneeId || '',
        status: task.status || '',
        dueDate: task.dueDate || '',
        tags: Array.isArray(task.tags) ? task.tags : [],
      })),
      requester: {
        username: myUsername,
      },
    };
  }, [projectId, project, members, tasks, myUsername]);

  // 현재 선택된 작업 카드에 속한 파일만 필터링 (TaskModal 등에 전달)
  const taskFiles = useMemo(() => {
    if (!selectedTask) return [];
    return files.filter((file) => file.taskId === selectedTask.taskId);
  }, [files, selectedTask]);

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
              <li>생성일: {day}</li>
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

      {/*작업 카드 상태 요약 카드*/}
      <TaskSummaryCard stats={stats} />

      {/* 버튼 모음 */}
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
              <IconUserAdd size={24} />
            </button>

            {isMemberModalOpen && (
              <ProjectMemberModal
                projectId={projectId}
                members={sortedMembers || []}
                myUsername={myUsername}
                pendingInvites={pendingInvites || []}
                onClose={() => setIsMemberModalOpen(false)}
              />
            )}

            {
              <button
                className={`cursor-pointer rounded-lg border px-4 py-2 transition ${
                  topTab === 'settings'
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setTopTab('settings');
                  // navigate(`/project/${projectId}/admin`);
                }}
              >
                <IconSettings size={24} />
              </button>
            }
          </div>
        </div>
      </div>

      {/* project ai 입력창*/}
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
          <>
            {/*<div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">*/}
            {/*  <div>*/}
            {/*    <h2 className="text-[24px] font-bold text-gray-900">팀 진행 타임라인</h2>*/}
            {/*    <p className="mt-1 text-sm text-gray-500">*/}
            {/*      작업 기간과 완료 상태를 사람별로 한눈에 볼 수 있어요.*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*</div>*/}
            <div className="space-y-6">
              {/* 1. 멤버별 담당 태스크 */}
              {sortedMembers.map((member) => {
                const taskList = tasksByMember[member.username] || [];
                const doneCount = taskList.filter((t) => t.status === 'DONE').length;

                return (
                  <div
                    key={member.username}
                    className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                      <div className="flex min-w-0 items-center gap-4">
                        {/*<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] font-semibold text-white">*/}
                        {/*  {member.nickname?.slice(0, 1).toUpperCase() || '?'}*/}
                        {/*</div>*/}
                        <UserProfileImg name={member.nickname} />

                        <div className="min-w-0">
                          <div className="text-lg font-semibold text-gray-900">
                            {member.nickname}
                          </div>
                          <div className="truncate text-sm text-gray-500">
                            {member.username} · {member.role}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-gray-600">
                          작업{' '}
                          <span className="font-semibold text-gray-900">{taskList.length}</span>개
                        </div>
                        <div className="text-green-700">
                          완료 <span className="font-semibold">{doneCount}</span>개
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      {taskList.length === 0 ? (
                        <div className="flex h-44 flex-col items-center justify-center text-center">
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <i className="ri-checkbox-line text-xl text-gray-400"></i>
                          </div>

                          <p className="text-base text-gray-400">아직 할당된 작업이 없습니다.</p>

                          <button
                            type="button"
                            onClick={() => {
                              setDefaultAssigneeId(member.username);
                              setIsCreateTaskModalOpen(true);
                            }}
                            className="mt-3 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            새 작업 추가
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {taskList.map((task) => (
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

              {/* 2. 담당자 없음 버킷 */}
              {(() => {
                const unassignedTasks = tasksByMember['UNASSIGNED'] || [];
                const doneCount = unassignedTasks.filter((t) => t.status === 'DONE').length;

                return (
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-500">
                          <i className="ri-user-unfollow-line text-xl"></i>
                        </div>

                        <div className="min-w-0">
                          <div className="text-lg font-semibold text-gray-900">담당자 없음</div>
                          <div className="truncate text-sm text-gray-500">배정 대기 중인 작업</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-gray-600">
                          작업{' '}
                          <span className="font-semibold text-gray-900">
                            {unassignedTasks.length}
                          </span>
                          개
                        </div>
                        <div className="text-green-700">
                          완료 <span className="font-semibold">{doneCount}</span>개
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      {unassignedTasks.length === 0 ? (
                        <div className="flex h-44 flex-col items-center justify-center text-center">
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <i className="ri-inbox-line text-xl text-gray-400"></i>
                          </div>
                          <p className="text-base text-gray-400">작업이 없습니다.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setDefaultAssigneeId('');
                              setIsCreateTaskModalOpen(true);
                            }}
                            className="mt-3 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            새 작업 추가
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {unassignedTasks.map((task) => (
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
              })()}
            </div>
          </>
        )}

        {topTab === 'file' && (
          <FilePanel rawFiles={files} tasks={tasks} projectId={Number(projectId)} />
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

        {/*{topTab === 'trash' && (*/}
        {/*  <ProjectTrashPanel deletedTasks={deletedTasks} deletedFiles={deletedFiles} />*/}
        {/*)}*/}

        {topTab === 'settings' && (
          <ProjectConfigPanel
            isLeader={isLeader}
            myUsername={myUsername}
            project={project}
            projectId={projectId}
            members={sortedMembers}
            pendingInvites={pendingInvites}
            // deletedCards={deletedTasks} - ProjectConfigPanel 내부에서 호출하므로 불필요해짐
            onBack={() => setTopTab('project')}
          />
        )}
      </div>

      <CreateTaskModal
        projectId={projectId}
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        members={members}
        defaultAssigneeId={defaultAssigneeId}
        // boardId={activeBoardId}
      />

      {selectedTask && (
        <TaskModal
          task={{
            ...selectedTask,
            tags: Array.isArray(selectedTask.tags) ? selectedTask.tags : [],
          }}
          onClose={closeTask}
          files={taskFiles}
          members={members}
          myUserName={myUsername}
        />
      )}
    </div>
  );
}
