import { useMemo, useState } from 'react';
import { useGetTasksByStatus } from '@/features/tasks/api/useGetTasksByStatus.js';
import { useRestoreTask } from '@/features/tasks/api/useRestoreTask.js';

const ADMIN_TABS = [
  { key: 'general', label: '일반', icon: 'ri-settings-3-line' },
  { key: 'members', label: '멤버', icon: 'ri-team-line' },
  { key: 'trash', label: '휴지통', icon: 'ri-delete-bin-6-line' },
  { key: 'danger', label: '위험 구역', icon: 'ri-alarm-warning-line' },
];

export default function ProjectAdminPanel({
  project,
  projectId,
  members = [],
  pendingInvites = [],
  // deletedCards = [],
  onBack,
}) {
  const [tab, setTab] = useState('general');

  const { data: deletedCards } = useGetTasksByStatus({ projectId, status: 'deleted' });
  const { mutate: restoreTask } = useRestoreTask();

  const projectName = project?.projectName || project?.name || '프로젝트 이름';
  const projectDescription = project?.description || '프로젝트 설명이 없습니다.';
  const createdDate = project?.createdDate ? String(project.createdDate).slice(0, 10) : '-';

  const normalizedMembers = useMemo(() => {
    return members.map((member, index) => ({
      id: member.id ?? member.memberId ?? member.username ?? index,
      username: member.username || member.name || 'unknown',
      displayName: member.nickname || member.username || member.name || '이름 없음',
      email: member.email || '',
      role: member.role || 'member',
    }));
  }, [members]);

  const handleRestoreCard = (taskId) => {
    if (!taskId) return;
    restoreTask({ projectId: Number(projectId), taskId: Number(taskId) });
  };

  const handlePermanentDeleteCard = () => {
    alert('영구 삭제 API는 백엔드 연동 후 연결 예정입니다.');
  };

  // const leaderCount = normalizedMembers.filter((member) => member.role === 'leader').length;
  // const memberCount = normalizedMembers.length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* 왼쪽 사이드바 */}
      <aside className="h-fit rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-6">
        <div className="border-b border-gray-100 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Project Admin
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">관리자 페이지</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            깃허브 Settings처럼 프로젝트 운영 기능을 한 곳에서 관리해요.
          </p>
        </div>

        {/*<div className="border-b border-gray-100 px-4 py-4">*/}
        {/*  <div className="grid grid-cols-2 gap-3">*/}
        {/*    <StatMiniCard label="멤버" value={memberCount} />*/}
        {/*    <StatMiniCard label="리더" value={leaderCount} />*/}
        {/*    <StatMiniCard label="초대 대기" value={pendingInvites.length} />*/}
        {/*    <StatMiniCard label="휴지통" value={deletedCards.length} />*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="px-3 py-3">
          <nav className="space-y-1">
            {ADMIN_TABS.map((item) => {
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
          <>
            <ContentCard>
              <SectionHeader
                eyebrow="GENERAL"
                title="프로젝트 정보"
                description="설정에 필요한 핵심 정보만 간단히 확인할 수 있어요."
              />

              {/*<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">*/}
              {/*  <InfoStatCard label="전체 작업" value={taskStats.total} icon="ri-file-list-3-line" />*/}
              {/*  <InfoStatCard label="대기" value={taskStats.todo} icon="ri-time-line" />*/}
              {/*  <InfoStatCard label="진행중" value={taskStats.inProgress} icon="ri-loader-4-line" />*/}
              {/*  <InfoStatCard label="완료" value={taskStats.completed} icon="ri-checkbox-circle-line" />*/}
              {/*</div>*/}

              <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <InfoField label="프로젝트 이름" value={projectName} />
                <InfoField label="생성일" value={createdDate} />
              </div>

              <div className="mt-4">
                <InfoField label="프로젝트 설명" value={projectDescription} multiline />
              </div>
            </ContentCard>

            {/*<ContentCard>*/}
            {/*  <SectionHeader*/}
            {/*    eyebrow="OVERVIEW"*/}
            {/*    title="빠른 요약"*/}
            {/*    description="지금 프로젝트 운영 상태를 한 번에 볼 수 있게 정리했어요."*/}
            {/*  />*/}

            {/*  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">*/}
            {/*    <QuickSummary*/}
            {/*      title="멤버 구성"*/}
            {/*      description={`현재 멤버 ${memberCount}명 · 리더 ${leaderCount}명`}*/}
            {/*      icon="ri-team-line"*/}
            {/*    />*/}
            {/*    <QuickSummary*/}
            {/*      title="초대 상태"*/}
            {/*      description={`수락 대기 중인 초대 ${pendingInvites.length}건`}*/}
            {/*      icon="ri-mail-open-line"*/}
            {/*    />*/}
            {/*    <QuickSummary*/}
            {/*      title="삭제 카드"*/}
            {/*      description={`휴지통에 들어간 카드 ${deletedCards.length}개`}*/}
            {/*      icon="ri-delete-bin-6-line"*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*</ContentCard>*/}
          </>
        )}

        {tab === 'members' && (
          <>
            <ContentCard>
              <SectionHeader
                eyebrow="MEMBERS"
                title="멤버 관리"
                description="깃허브 People 화면처럼 멤버 목록을 한눈에 볼 수 있게 정리했어요."
              />

              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                  <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value=""
                    readOnly
                    placeholder="Find a member..."
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
                        <Avatar name={member.displayName} />
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-gray-900">
                            {member.displayName}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {member.username}
                            {member.email ? ` · ${member.email}` : ''}
                          </p>
                        </div>
                      </div>

                      <div>
                        <RoleBadge role={member.role} />
                      </div>

                      <div>
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          방출
                        </button>
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
                  <div>Email / Username</div>
                  <div>Status</div>
                </div>

                {pendingInvites.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">
                    대기 중인 초대가 없습니다.
                  </div>
                ) : (
                  pendingInvites.map((invite, index) => (
                    <div
                      key={invite.id ?? invite.email ?? index}
                      className="grid grid-cols-[1fr_140px] border-b border-gray-100 px-5 py-4 last:border-b-0"
                    >
                      <div className="text-sm text-gray-700">
                        {invite.email || invite.username || '알 수 없음'}
                      </div>
                      <div className="text-sm font-medium text-amber-600">Pending</div>
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
                eyebrow="ACTION"
                title="휴지통 안내"
                description="지금은 UI만 먼저 구성했고, 이후 카드 복구/영구 삭제 API를 연결하면 돼요."
              />

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <ActionHint
                  title="복구 기능"
                  description="삭제된 카드를 원래 보드로 되돌리는 기능 연결"
                  icon="ri-arrow-go-back-line"
                />
                <ActionHint
                  title="영구 삭제"
                  description="휴지통에서 완전히 제거하는 기능 연결"
                  icon="ri-delete-bin-5-line"
                />
              </div>
            </ContentCard>

            <ContentCard>
              <SectionHeader
                eyebrow="TRASH"
                title="카드 휴지통"
                description="삭제된 카드들을 모아두고 복구나 영구 삭제를 연결할 수 있는 자리예요."
              />

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                <div className="grid grid-cols-[minmax(0,1.4fr)_160px_220px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  <div>Task</div>
                  <div>Assignee</div>
                  <div>Action</div>
                </div>

                {deletedCards.length === 0 ? (
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
                          삭제 시간: {card.deletedDate || '-'}
                        </p>
                      </div>

                      <div className="text-sm text-gray-700">{card.assigneeName || '미지정'}</div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestoreCard(card.taskId)}
                          className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          복구
                        </button>
                        <button
                          type="button"
                          onClick={handlePermanentDeleteCard}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
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
                description="삭제된 파일들을 모아두고 복구나 영구 삭제를 연결할 수 있는 자리예요."
              />

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                <div className="grid grid-cols-[minmax(0,1.4fr)_160px_220px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  <div>Task</div>
                  <div>Assignee</div>
                  <div>Action</div>
                </div>

                {deletedCards.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-gray-400">
                    삭제된 카드가 없습니다.
                  </div>
                ) : (
                  deletedCards.map((card, index) => (
                    <div
                      key={card.id ?? index}
                      className="grid grid-cols-[minmax(0,1.4fr)_160px_220px] items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-gray-900">
                          {card.title || '제목 없음'}
                        </p>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          삭제 시간: {card.deletedAt || '-'}
                        </p>
                      </div>

                      <div className="text-sm text-gray-700">{card.assignee || '미지정'}</div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestoreCard(card.taskId ?? card.id)}
                          className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          복구
                        </button>
                        <button
                          type="button"
                          onClick={handlePermanentDeleteCard}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
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

        {tab === 'danger' && (
          <ContentCard>
            <SectionHeader
              eyebrow="DANGER ZONE"
              title="위험 구역"
              description="깃허브 Danger zone처럼 위험한 작업은 아래에서 분리해서 보여줘요."
              danger
            />

            <div className="mt-6 space-y-4">
              {/*<DangerRow*/}
              {/*  title="프로젝트 이름 변경"*/}
              {/*  description="프로젝트 식별값과 표시명을 바꾸는 기능을 나중에 연결할 수 있어요."*/}
              {/*  buttonLabel="이름 변경"*/}
              {/*/>*/}
              {/*<DangerRow*/}
              {/*  title="프로젝트 보관"*/}
              {/*  description="프로젝트를 읽기 전용 또는 비활성 상태처럼 처리하는 기능으로 확장할 수 있어요."*/}
              {/*  buttonLabel="프로젝트 보관"*/}
              {/*/>*/}
              <DangerRow
                title="프로젝트 삭제"
                description="프로젝트와 관련된 데이터가 사라질 수 있어요. 실제 삭제 연결 전까지는 UI만 먼저 구성해둔 상태예요."
                buttonLabel="프로젝트 삭제"
                strong
              />
            </div>
          </ContentCard>
        )}
      </section>
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

function StatMiniCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InfoStatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <i className={`${icon} text-lg text-gray-400`}></i>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
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

function DangerRow({ title, description, buttonLabel, strong = false }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-lg font-semibold text-red-700">{title}</p>
        <p className="mt-2 text-sm leading-6 text-red-600">{description}</p>
      </div>

      <button
        type="button"
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
  const isLeader = role === 'leader';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isLeader ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {role}
    </span>
  );
}

function Avatar({ name }) {
  const initial = name?.slice(0, 1)?.toUpperCase() || '?';

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-sm font-semibold text-white">
      {initial}
    </div>
  );
}
