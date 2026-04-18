import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDisplayDate } from '@/features/files/utils/fileFormatters.js';
import { useGetDeletedFiles } from '@/features/files/api/useGetDeletedFiles.js';
import { usePermanentDeleteFiles } from '@/features/files/api/usePermanentDeleteFiles.js';
import { useRestoreFiles } from '@/features/files/api/useRestoreFiles.js';
import { useDeleteMember } from '@/features/members/api/useDeleteMember.js';
import { useDeleteProject } from '@/features/projects/api/useDeleteProject.js';
import { useGetTasksByStatus } from '@/features/tasks/api/useGetTasksByStatus.js';
import { usePermanentDeleteTask } from '@/features/tasks/api/usePermanentDeleteTask.js';
import { useRestoreTask } from '@/features/tasks/api/useRestoreTask.js';
import UserProfileImg from '@/shared/components/userProfileImg.jsx';

export default function ProjectConfigPanel(props) {
  const { projectId, project, members, pendingInvites, myUsername, isLeader, onBack } = props;
  const navigate = useNavigate();
  const [tab, setTab] = useState('general');
  const [userInput, setUserInput] = useState('');

  const { data: deletedCards = [] } = useGetTasksByStatus({ projectId, status: 'DELETED' });
  const { data: deletedFiles = [] } = useGetDeletedFiles(Number(projectId));

  const { mutate: restoreTask } = useRestoreTask();
  const { mutate: restoreFiles } = useRestoreFiles();
  const { mutate: permanentDeleteFiles } = usePermanentDeleteFiles();
  const { mutate: permanentDeleteTask } = usePermanentDeleteTask();
  const { mutate: deleteProject } = useDeleteProject();

  /** @type {import('@tanstack/react-query').UseMutateFunction<void, Error, import('@/features/members/api/useDeleteMember.js').RequestDeleteMemberDTO, unknown>} */
  const deleteMember = useDeleteMember().mutate;

  const projectName = project?.projectName || project?.name || '프로젝트 이름';
  const projectDescription = project?.description || '프로젝트 설명이 없습니다.';
  const createdDate = project?.createdDate ? String(project.createdDate).slice(0, 10) : '-';

  const normalizedMembers = useMemo(() => {
    return members.map((member, index) => ({
      id: member.username ?? index,
      username: member.username || member.name || 'unknown',
      displayName: member.nickname || member.username || member.name || '홍길동',
      email: member.email || '-',
      role: member.role || 'MEMBER',
    }));
  }, [members]);

  const handleRestoreCard = (taskId) => {
    if (!taskId) return;
    restoreTask({ projectId: Number(projectId), taskId: Number(taskId) });
  };

  const handlePermanentDeleteCard = (taskId) => {
    if (!taskId) return;
    if (window.confirm('정말로 이 작업을 영구 삭제하시겠습니까? 복구할 수 없습니다.')) {
      permanentDeleteTask({ projectId: Number(projectId), taskId: Number(taskId) });
    }
  };

  const handleRestoreFile = (file) => {
    if (!file) return;
    restoreFiles({ selectedFiles: [file], projectId: Number(projectId) });
  };

  const handlePermanentDeleteFile = (file) => {
    if (!file) return;
    if (window.confirm('정말로 이 파일을 영구 삭제하시겠습니까? 복구할 수 없습니다.')) {
      permanentDeleteFiles({ selectedFiles: [file], projectId: Number(projectId) });
    }
  };

  const handleDeleteProject = () => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      deleteProject(projectId, {
        onSuccess: () => {
          navigate('/dashboard'); // 삭제 완료 후 대시보드로 이동
        },
      });
    }
  };

  const handleKickMember = (memberUsername, memberNickname) => {
    const comment =
      memberUsername === myUsername
        ? `정말로 나가시겠습니까?`
        : `정말로 ${memberNickname} 님을 방출하시겠습니까?`;
    if (window.confirm(comment)) {
      deleteMember({ projectId: projectId, targetName: memberUsername });
    }
  };

  // const leaderCount = normalizedMembers.filter((member) => member.role === 'LEADER').length;
  // const memberCount = normalizedMembers.length;

  const ADMIN_TABS = [
    { key: 'general', label: '일반', icon: 'ri-settings-3-line' },
    { key: 'members', label: '멤버', icon: 'ri-team-line' },
    { key: 'trash', label: '휴지통', icon: 'ri-delete-bin-6-line' },
    { key: 'danger', label: '위험 구역', icon: 'ri-alarm-warning-line' },
  ];

  const menuTabs = isLeader ? ADMIN_TABS : ADMIN_TABS.filter((m) => m.key !== 'danger');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* 왼쪽 사이드바 */}
      <aside className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-6">
        <div className="border-b border-gray-100 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Project Config
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">프로젝트 관리</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            프로젝트 운영 기능을 한 곳에서 관리해요.
          </p>
        </div>

        {/*<div className="border-b border-gray-100 px-4 py-4">*/}
        {/*  <div className="grid grid-cols-2 gap-3">*/}
        {/*    <StatMiniCard label="멤버" value={memberCount} />*/}
        {/*    <StatMiniCard label="리더" value={leaderCount} />*/}
        {/*    <StatMiniCard label="초대 대기" value={pendingInvites?.length || 0} />*/}
        {/*    <StatMiniCard label="휴지통" value={deletedCards.length + deletedFiles.length} />*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="px-3 py-3">
          <nav className="space-y-1">
            {menuTabs.map((item) => {
              const active = tab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? item.key === 'danger'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-blue-50 text-blue-700'
                      : item.key === 'danger'
                        ? 'text-red-500 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${item.icon} text-lg`}></i>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onBack}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <i className="ri-arrow-left-line"></i>
            프로젝트로 돌아가기
          </button>
        </div>
      </aside>

      {/* 오른쪽 본문 */}
      <section className="min-w-0 space-y-6">
        {tab === 'general' && (
          <ContentCard>
            <SectionHeader
              eyebrow="GENERAL"
              title="프로젝트 정보"
              description="설정에 필요한 핵심 정보만 간단히 확인할 수 있어요."
            />
            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <InfoField label="프로젝트 이름" value={projectName} />
              <InfoField label="생성일" value={createdDate} />
            </div>
            <div className="mt-4">
              <InfoField label="프로젝트 설명" value={projectDescription} /* multiline={true} */ />
            </div>
          </ContentCard>
        )}

        {tab === 'members' && (
          <>
            <ContentCard>
              <SectionHeader
                eyebrow="MEMBERS"
                title="멤버 관리"
                description="멤버 목록을 한눈에 볼 수 있게 정리했어요."
              />

              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                  <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={userInput}
                    // readOnly
                    onChange={(event) => {
                      setUserInput(event.target.value);
                    }}
                    placeholder="검색 / 초대할 사용자 아이디 입력"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Invite member
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                <div className="grid grid-cols-[minmax(0,1.6fr)_140px_120px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  <div>Members</div>
                  <div>Role</div>
                  <div>Action</div>
                </div>
                {normalizedMembers.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-gray-400">
                    등록된 멤버가 없습니다.
                  </div>
                ) : (
                  normalizedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="grid grid-cols-[minmax(0,1.6fr)_140px_120px] items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <UserProfileImg name={member.displayName} />
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-gray-900">
                            {member.displayName}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {member.username}
                            {member.email && member.email !== '-' ? ` · ${member.email}` : ''}
                          </p>
                        </div>
                      </div>
                      <div>
                        <RoleBadge role={member.role} />
                      </div>
                      <div className="flex items-center gap-2">
                        {
                          <button
                            type="button"
                            onClick={() => handleKickMember(member.username, member.displayName)}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            {member.username !== myUsername ? '방출' : '탈퇴'}
                          </button>
                        }
                        {isLeader && (
                          <div>
                            {member.username !== myUsername && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleKickMember(member.username, member.displayName)
                                }
                                className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                              >
                                리더 양도
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ContentCard>

            <ContentCard>
              <SectionHeader
                eyebrow="INVITES"
                title="초대 현황"
                description="현재 수락 대기 중인 초대도 같이 확인할 수 있어요."
              />

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                <div className="grid grid-cols-[1fr_140px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  <div>Username</div>
                  <div>Status</div>
                </div>

                {!pendingInvites || pendingInvites.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">
                    대기 중인 초대가 없습니다.
                  </div>
                ) : (
                  pendingInvites.map((invite, index) => (
                    <div
                      key={invite.id ?? invite.email ?? index}
                      className="grid grid-cols-[1fr_140px] border-b border-gray-100 px-5 py-4 last:border-b-0"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <UserProfileImg name={invite.invitedName} pendingInvite={true} />
                        <div className="truncate text-base font-semibold text-gray-900">
                          {invite.invitedName}
                        </div>
                      </div>
                      <div className="flex h-7 w-20 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                        수락 대기중
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ContentCard>
          </>
        )}

        {tab === 'trash' && (
          <>
            <ContentCard>
              <SectionHeader
                eyebrow="TRASH"
                title="카드 휴지통"
                description="삭제된 카드들을 모아두고 복구나 영구 삭제를 진행합니다."
              />
              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                <div className="grid grid-cols-[minmax(0,1.4fr)_160px_220px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  <div>Task</div>
                  <div>Assignee</div>
                  <div>Action</div>
                </div>
                {!deletedCards || deletedCards.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-gray-400">
                    삭제된 카드가 없습니다.
                  </div>
                ) : (
                  deletedCards.map((card) => (
                    <div
                      key={card.taskId}
                      className="grid grid-cols-[minmax(0,1.4fr)_160px_220px] items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-gray-900">
                          {card.title || '제목 없음'}
                        </p>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          삭제 일시: {formatDisplayDate(card.deletedDate) || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserProfileImg name={card.assigneeName} size={'md'} />
                        <div className="text-sm text-gray-700">{card.assigneeName || '미지정'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestoreCard(card.taskId)}
                          className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          복구
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDeleteCard(card.taskId)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          영구 삭제
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ContentCard>

            <ContentCard>
              <SectionHeader
                eyebrow="TRASH"
                title="파일 휴지통"
                description="삭제된 파일들을 모아두고 복구나 영구 삭제를 진행합니다."
              />
              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                <div className="grid grid-cols-[minmax(0,1.4fr)_160px_220px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  <div>File Name</div>
                  <div>Uploader</div>
                  <div>Action</div>
                </div>
                {!deletedFiles || deletedFiles.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-gray-400">
                    삭제된 파일이 없습니다.
                  </div>
                ) : (
                  deletedFiles.map((file) => (
                    <div
                      key={file.uuid}
                      className="grid grid-cols-[minmax(0,1.4fr)_160px_220px] items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-gray-900">
                          {file.originalFilename || '제목 없음'}
                        </p>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          삭제 일시: {formatDisplayDate(file.deletedDate) || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserProfileImg name={file.uploadedBy} size={'md'} />
                        <div className="text-sm text-gray-700">{file.uploadedBy || '미지정'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestoreFile(file)}
                          className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          복구
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDeleteFile(file)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          영구 삭제
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ContentCard>
          </>
        )}

        {isLeader && tab === 'danger' && (
          <ContentCard>
            <SectionHeader
              eyebrow="DANGER ZONE"
              title="위험 구역"
              description="깃허브 Danger zone처럼 위험한 작업은 아래에서 분리해서 보여줘요."
              danger
            />
            <div className="mt-6 space-y-4">
              <DangerRow
                title="프로젝트 삭제"
                description="프로젝트와 관련된 데이터가 사라질 수 있어요."
                buttonLabel="프로젝트 삭제"
                onClick={handleDeleteProject}
                strong
              />
            </div>
          </ContentCard>
        )}
      </section>
    </div>
  );
}

function StatMiniCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function QuickSummary({ title, description, icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg text-gray-700 shadow-sm">
          <i className={icon}></i>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ActionHint({ title, description, icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg text-gray-700 shadow-sm">
          <i className={icon}></i>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, multiline = false }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 ${multiline ? 'min-h-[132px]' : ''}`}
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-3 text-base text-gray-900 ${multiline ? 'leading-7' : 'font-semibold'}`}>
        {value}
      </p>
    </div>
  );
}

function ContentCard({ children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">{children}</div>
  );
}

function SectionHeader({ eyebrow, title, description, danger = false }) {
  return (
    <div className="border-b border-gray-100 pb-4">
      <p
        className={`text-xs font-semibold uppercase tracking-[0.18em] ${
          danger ? 'text-red-500' : 'text-blue-600'
        }`}
      >
        {eyebrow}
      </p>
      <h3 className="mt-2 text-3xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}

function DangerRow({ title, description, buttonLabel, strong = false, onClick }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-lg font-semibold text-red-700">{title}</p>
        <p className="mt-2 text-sm leading-6 text-red-600">{description}</p>
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
          strong
            ? 'border-red-300 bg-red-500 text-white hover:bg-red-600'
            : 'border-red-200 bg-white text-red-600 hover:bg-red-100'
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function RoleBadge({ role }) {
  const isLeader = role === 'LEADER';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isLeader ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-700'
      }`}
    >
      {role}
    </span>
  );
}
