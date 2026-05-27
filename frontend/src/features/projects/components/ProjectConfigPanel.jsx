import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDisplayDate } from '@/features/files/utils/fileFormatters.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { useGetDeletedFiles } from '@/features/files/api/useGetDeletedFiles.js';
import { usePermanentDeleteFiles } from '@/features/files/api/usePermanentDeleteFiles.js';
import { useRestoreFiles } from '@/features/files/api/useRestoreFiles.js';
import { useDeleteMember } from '@/features/members/api/useDeleteMember.js';
import { useDeleteProject } from '@/features/projects/api/useDeleteProject.js';
import { useGetTasksByStatus } from '@/features/tasks/api/useGetTasksByStatus.js';
import { usePermanentDeleteTask } from '@/features/tasks/api/usePermanentDeleteTask.js';
import { useRestoreTask } from '@/features/tasks/api/useRestoreTask.js';
import { formatLocalDateTime } from '@/features/tasks/utils/task-format.js';
import {
  IconArrowLeft,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconTeam,
  IconTrash,
  IconWarning,
} from '@/shared/assets/icons.js';
import { UserProfileImg } from '@/shared/components/index.js';

/**
 * @typedef {import('@/types/project.js').ProjectDTO} ProjectDTO
 * @typedef {import('@/types/member.js').ProjectMemberDTO} ProjectMemberDTO
 * @typedef {import('@/types/invitation.js').ProjectInvitationDTO} ProjectInvitationDTO
 * @param {object} props
 * @param {string | number} props.projectId
 * @param {ProjectDTO} props.project
 * @param {ProjectMemberDTO[]} props.members
 * @param {ProjectInvitationDTO[]} props.pendingInvites
 * @param {string} props.myUsername
 * @param {boolean} props.isLeader
 * @param {() => void} props.onBack
 */
export default function ProjectConfigPanel(props) {
  const { projectId, project, members, pendingInvites, myUsername, isLeader, onBack } = props;
  const navigate = useNavigate();
  const [tab, setTab] = useState('general');
  const [userInput, setUserInput] = useState('');

  const {
    data: deletedCards = [],
    isError: isDeletedCardsError,
    error: deletedCardsError,
  } = useGetTasksByStatus({ projectId, status: 'DELETED' });
  const {
    data: deletedFiles = [],
    isError: isDeletedFilesError,
    error: deletedFilesError,
  } = useGetDeletedFiles(Number(projectId));

  const { mutate: restoreTask } = useRestoreTask();
  const { mutate: restoreFiles } = useRestoreFiles();
  const { mutate: permanentDeleteFiles } = usePermanentDeleteFiles();
  const { mutate: permanentDeleteTask } = usePermanentDeleteTask();
  const { mutate: deleteProject } = useDeleteProject();

  const deleteMember = useDeleteMember().mutate;

  const projectName = project?.projectName || project?.name || '프로젝트 이름';
  const projectDescription = project?.description || '프로젝트 설명이 없습니다.';
  const createdDate = formatLocalDateTime(project?.creationDate);
  const INVITE_GRID_COLS = 'grid-cols-[minmax(0,1fr)_120px]';
  const TRASH_GRID_COLS = 'grid-cols-[minmax(0,1.4fr)_160px_220px]';

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
          navigate('/dashboard');
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

  const ADMIN_TABS = [
    { key: 'general', label: '일반', Icon: IconSettings },
    { key: 'members', label: '멤버', Icon: IconTeam },
    { key: 'trash', label: '휴지통', Icon: IconTrash },
    { key: 'danger', label: '위험 구역', Icon: IconWarning },
  ];

  const menuTabs = isLeader ? ADMIN_TABS : ADMIN_TABS.filter((m) => m.key !== 'danger');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* 왼쪽 사이드바 */}
      <aside className="h-fit rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-6">
        <div className="border-b border-border px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Project Config
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">프로젝트 관리</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            프로젝트 운영 기능을 한 곳에서 관리해요.
          </p>
        </div>

        <div className="px-3 py-3">
          <nav className="space-y-1">
            {menuTabs.map((item) => {
              const active = tab === item.key;
              const { Icon } = item;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? item.key === 'danger'
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                        : 'bg-primary/15 text-primary'
                      : item.key === 'danger'
                        ? 'hover:bg-red-500/150/12 text-red-600 dark:text-red-400'
                        : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onBack}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/50"
          >
            <IconArrowLeft size={16} />
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
              <InfoField label="프로젝트 설명" value={projectDescription} />
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
                  <IconSearch
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="검색 / 초대할 사용자 아이디 입력"
                    className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 text-sm text-muted-foreground outline-none focus:bg-card"
                  />
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
                <div className="min-w-[520px]">
                  <div className="grid grid-cols-[minmax(0,1.6fr)_140px_120px] border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-5">
                    <div>Members</div>
                    <div>Role</div>
                    <div>Action</div>
                  </div>
                  {normalizedMembers.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5">
                      등록된 멤버가 없습니다.
                    </div>
                  ) : (
                    normalizedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="grid grid-cols-[minmax(0,1.6fr)_140px_120px] items-center gap-4 border-b border-border px-4 py-4 last:border-b-0 sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <UserProfileImg name={member.displayName} />
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-foreground">
                              {member.displayName}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {member.username}
                              {member.email && member.email !== '-' ? ` · ${member.email}` : ''}
                            </p>
                          </div>
                        </div>
                        <div>
                          <RoleBadge role={member.role} />
                        </div>
                        <div className="flex items-center gap-2">
                          {!(member.username === myUsername && member.role === 'LEADER') && (
                            <button
                              type="button"
                              onClick={() => handleKickMember(member.username, member.displayName)}
                              className="rounded-lg border border-red-200 bg-card px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/15"
                            >
                              {member.username !== myUsername ? '방출' : '탈퇴'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ContentCard>

            <ContentCard>
              <SectionHeader
                eyebrow="INVITES"
                title="초대 현황"
                description="현재 수락 대기 중인 초대도 같이 확인할 수 있어요."
              />

              <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
                <div className="min-w-[380px]">
                  <div
                    className={`grid ${INVITE_GRID_COLS} items-center border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-5`}
                  >
                    <div>Username</div>
                    <div className="justify-self-start pl-2">Status</div>
                  </div>

                  {!pendingInvites || pendingInvites.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-5">
                      대기 중인 초대가 없습니다.
                    </div>
                  ) : (
                    pendingInvites.map((invite, index) => (
                      <div
                        key={invite.id ?? invite.email ?? index}
                        className={`grid ${INVITE_GRID_COLS} items-center gap-4 border-b border-border px-4 py-4 last:border-b-0 sm:px-5`}
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <UserProfileImg name={invite.invitedName} pendingInvite={true} />
                          <div className="truncate text-base font-semibold text-foreground">
                            {invite.invitedName}
                          </div>
                        </div>
                        <div className="ml-2 inline-flex h-5 items-center justify-center justify-self-start rounded-lg bg-muted px-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Waiting
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ContentCard>
          </>
        )}

        {tab === 'trash' && (
          <div className="space-y-6">
            <ContentCard>
              <SectionHeader
                eyebrow="TRASH"
                title="카드 휴지통"
                description="삭제된 카드들을 모아두고 복구나 영구 삭제를 진행합니다."
              />
              <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
                <div className="min-w-[720px]">
                  <div
                    className={`grid ${TRASH_GRID_COLS} items-center border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-5`}
                  >
                    <div>Task</div>
                    <div>Assignee</div>
                    <div className="justify-self-center">Action</div>
                  </div>
                  {isDeletedCardsError ? (
                    <div className="px-4 py-12 text-center text-sm text-red-500 sm:px-5">
                      {getErrorMessage(
                        deletedCardsError,
                        '삭제된 카드 목록을 불러오지 못했습니다.',
                      )}
                    </div>
                  ) : !deletedCards || deletedCards.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5">
                      삭제된 카드가 없습니다.
                    </div>
                  ) : (
                    deletedCards.map((card) => (
                      <div
                        key={card.taskId}
                        className={`grid ${TRASH_GRID_COLS} items-center gap-4 border-b border-border px-4 py-4 last:border-b-0 sm:px-5`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-foreground">
                            {card.title || '제목 없음'}
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            삭제 일시: {formatDisplayDate(card.deletedDate) || '-'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserProfileImg name={card.assigneeName} size={'md'} />
                          <div className="truncate text-sm leading-5 text-foreground">
                            {card.assigneeName || '미지정'}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestoreCard(card.taskId)}
                            className="flex items-center gap-1 rounded-lg border border-blue-200 bg-card px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-primary/15"
                          >
                            <IconRefresh size={14} className="mr-1" />
                            복구
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentDeleteCard(card.taskId)}
                            className="rounded-lg border border-red-200 bg-card px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/15"
                          >
                            영구 삭제
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ContentCard>

            <ContentCard>
              <SectionHeader
                eyebrow="TRASH"
                title="파일 휴지통"
                description="삭제된 파일들을 모아두고 복구나 영구 삭제를 진행합니다."
              />
              <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
                <div className="min-w-[720px]">
                  <div
                    className={`grid ${TRASH_GRID_COLS} items-center border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-5`}
                  >
                    <div>File Name</div>
                    <div>Uploader</div>
                    <div className="justify-self-center">Action</div>
                  </div>
                  {isDeletedFilesError ? (
                    <div className="px-4 py-12 text-center text-sm text-red-500 sm:px-5">
                      {getErrorMessage(
                        deletedFilesError,
                        '삭제된 파일 목록을 불러오지 못했습니다.',
                      )}
                    </div>
                  ) : !deletedFiles || deletedFiles.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5">
                      삭제된 파일이 없습니다.
                    </div>
                  ) : (
                    deletedFiles.map((file) => (
                      <div
                        key={file.uuid}
                        className={`grid ${TRASH_GRID_COLS} items-center gap-4 border-b border-border px-4 py-4 last:border-b-0 sm:px-5`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-foreground">
                            {file.originalFilename || '제목 없음'}
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            삭제 일시: {formatDisplayDate(file.deletedDate) || '-'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserProfileImg name={file.uploadedBy} size={'md'} />
                          <div className="truncate text-sm leading-5 text-foreground">
                            {file.uploadedBy || '미지정'}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestoreFile(file)}
                            className="flex items-center gap-1 rounded-lg border border-blue-200 bg-card px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-primary/15"
                          >
                            <IconRefresh size={14} className="mr-1" />
                            복구
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentDeleteFile(file)}
                            className="rounded-lg border border-red-200 bg-card px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/15"
                          >
                            영구 삭제
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ContentCard>
          </div>
        )}

        {isLeader && tab === 'danger' && (
          <ContentCard>
            <SectionHeader
              eyebrow="DANGER ZONE"
              title="위험 구역"
              description="주의: 프로젝트와 관련된 데이터가 사라질 수 있어요."
              danger
            />
            <div className="mt-6">
              <DangerRow
                title="프로젝트 삭제"
                description="이 프로젝트를 삭제하면 복구할 수 없습니다."
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

function InfoField({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ContentCard({ children }) {
  return <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">{children}</div>;
}

function SectionHeader({ eyebrow, title, description, danger = false }) {
  return (
    <div className="border-b border-border pb-4">
      <p
        className={`text-xs font-semibold uppercase tracking-[0.18em] ${danger ? 'text-red-600 dark:text-red-400' : 'text-primary'}`}
      >
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function DangerRow({ title, description, buttonLabel, strong = false, onClick }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-500/10 px-5 py-5 md:flex-row md:items-center md:justify-between dark:border-red-500/40">
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
            : 'border-red-200 bg-card text-red-600 hover:bg-red-500/15 dark:border-red-500/40'
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isLeader ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' : 'bg-primary/15 text-primary'}`}
    >
      {role}
    </span>
  );
}
