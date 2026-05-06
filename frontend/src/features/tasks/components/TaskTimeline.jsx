import { useEffect, useMemo, useState } from 'react';
import {
  addDays,
  clampDate,
  differenceInDays,
  endOfMonth,
  formatISO,
  formatMonthLabel,
  formatShortDate,
  getDaysInMonth,
  parseDate,
  startOfMonth,
} from '@/features/tasks/utils/timeline-date.js';
import { buildLanes } from '@/features/tasks/utils/timeline-layout.js';
import { getTaskVisual } from '@/features/tasks/utils/timeline-style.js';
import { IconChevronLeft, IconChevronRight } from '@/shared/assets/icons.js';

const DAY_WIDTH = 44;
const NAME_COL_WIDTH = 190;
const BAR_HEIGHT = 38;
const BAR_GAP = 10;
const ROW_BASE_HEIGHT = 82;

/**
 * 태스크 타임라인 컴포넌트
 * @typedef {import('@/types/task.js').TaskData} TaskData
 * @typedef {import('@/types/member.js').ProjectMember} ProjectMember
 * @param {object} props
 * @param {TaskData[]} props.tasks - 타임라인에 표시할 태스크 목록
 * @param {ProjectMember[]} props.members - 프로젝트 멤버 목록
 * @param {(taskId: number) => void} props.onTaskClick - 태스크 클릭 시 호출되는 콜백
 */
export default function TaskTimeline({ tasks = [], members: members = [], onTaskClick }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [autoAligned, setAutoAligned] = useState(false);

  useEffect(() => {
    if (autoAligned || tasks.length === 0) return;

    const today = new Date();
    const todayMonthStart = startOfMonth(today);
    const todayMonthEnd = endOfMonth(today);

    const datedTask = tasks.find((task) => {
      const raw = task.startDate || task.dueDate || task.createdDate;
      const d = parseDate(raw);
      if (!d || Number.isNaN(d.getTime())) return false;
      return d >= todayMonthStart && d <= todayMonthEnd;
    });

    if (!datedTask) return;

    const baseDate = parseDate(datedTask.startDate || datedTask.dueDate || datedTask.createdDate);
    if (!baseDate || Number.isNaN(baseDate.getTime())) return;

    const baseMonth = startOfMonth(baseDate);
    const isStillTodayMonth =
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth();

    if (!isStillTodayMonth) return;

    setCurrentMonth(baseMonth);
    setAutoAligned(true);
  }, [tasks, currentMonth, autoAligned]);

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  const daysInMonth = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const monthDays = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, index) => addDays(monthStart, index));
  }, [daysInMonth, monthStart]);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === currentMonth.getFullYear() &&
    today.getMonth() === currentMonth.getMonth();

  const todayOffset = isCurrentMonth ? differenceInDays(today, monthStart) : -1;

  const rows = useMemo(() => {
    return members.map((member) => {
      const memberTasks = tasks.filter((task) => task.assigneeId === member.username);
      const lanes = buildLanes(memberTasks, monthStart, monthEnd);

      const laneBars = lanes.flatMap((lane, laneIndex) =>
        lane.map((task) => {
          const visibleStart = clampDate(task._taskStart, monthStart, monthEnd);
          const visibleEnd = clampDate(task._taskEnd, monthStart, monthEnd);

          const startOffset = differenceInDays(visibleStart, monthStart);
          const endOffset = differenceInDays(visibleEnd, monthStart);
          const span = Math.max(1, endOffset - startOffset + 1);

          return {
            ...task,
            laneIndex,
            startOffset,
            span,
          };
        }),
      );

      const rowHeight =
        Math.max(1, lanes.length) * (BAR_HEIGHT + BAR_GAP) + (ROW_BASE_HEIGHT - BAR_HEIGHT);

      return {
        member,
        bars: laneBars,
        rowHeight,
      };
    });
  }, [tasks, members, monthStart, monthEnd]);

  const totalGridWidth = daysInMonth * DAY_WIDTH;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-card px-8 py-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">팀 진행 타임라인</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            작업 기간과 완료 상태를 멤버별로 분석합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
            }
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50"
          >
            <IconChevronLeft size={20} />
          </button>

          <div
            className="min-w-[120px] cursor-pointer rounded-lg border border-border bg-card py-2 text-center text-sm font-semibold text-foreground shadow-sm"
            onClick={() => {
              setCurrentMonth(new Date());
              setAutoAligned(false);
            }}
          >
            {formatMonthLabel(currentMonth)}
          </div>

          <button
            type="button"
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
            }
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50"
          >
            <IconChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="custom-scrollbar overflow-x-auto">
        {tasks.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto mb-8 flex w-full max-w-[320px] justify-center">
              <svg
                viewBox="0 0 320 180"
                className="h-auto w-full"
                role="img"
                aria-label="타임라인 비어있음 일러스트"
              >
                <defs>
                  <linearGradient id="timelineEmptyGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#EFF6FF" />
                    <stop offset="100%" stopColor="#EEF2FF" />
                  </linearGradient>
                </defs>
                <rect
                  x="22"
                  y="24"
                  width="276"
                  height="132"
                  rx="20"
                  fill="url(#timelineEmptyGradient)"
                  stroke="#C7D2FE"
                />
                <rect x="46" y="48" width="98" height="12" rx="6" fill="#93C5FD" />
                <rect x="46" y="74" width="224" height="8" rx="4" fill="#BFDBFE" />
                <rect x="46" y="94" width="210" height="8" rx="4" fill="#BFDBFE" />
                <rect x="46" y="114" width="178" height="8" rx="4" fill="#BFDBFE" />
                <circle cx="250" cy="62" r="16" fill="#C7D2FE" />
                <path
                  d="M244 62h12M250 56v12"
                  stroke="#4F46E5"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-foreground">작업이 없습니다</h3>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              작업이 생성되면 타임라인이 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="min-w-max" style={{ width: NAME_COL_WIDTH + totalGridWidth }}>
            <div className="sticky top-0 z-20 flex border-b border-border bg-muted">
              <div
                className="shrink-0 border-r border-border px-8 py-4"
                style={{ width: NAME_COL_WIDTH }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Team Member
                </div>
              </div>

              <div className="relative shrink-0" style={{ width: totalGridWidth }}>
                <div className="flex">
                  {monthDays.map((day) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isToday = isCurrentMonth && day.getDate() === today.getDate();

                    return (
                      <div
                        key={formatISO(day)}
                        className={`flex h-[72px] flex-col items-center justify-center border-r border-border ${
                          isWeekend ? 'bg-muted/30' : ''
                        } ${isToday ? 'bg-primary/10' : ''}`}
                        style={{ width: DAY_WIDTH }}
                      >
                        <div className="text-[9px] font-black uppercase text-gray-400">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}
                        </div>
                        <div
                          className={`mt-0.5 text-sm font-black ${
                            isToday ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {rows.map((row) => (
              <div
                key={row.member.username}
                className="group flex border-b border-border last:border-b-0"
              >
                <div
                  className="flex shrink-0 items-start border-r border-border bg-card px-8 py-6 transition-colors group-hover:bg-muted/30"
                  style={{ width: NAME_COL_WIDTH, minHeight: row.rowHeight }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-indigo-50 text-sm font-black text-indigo-600 shadow-sm">
                      {(row.member.displayName || row.member.username).slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-foreground">
                        {row.member.displayName || row.member.username}
                      </div>
                      <div className="truncate text-[10px] font-bold uppercase text-muted-foreground">
                        {row.member.role}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="relative shrink-0 transition-colors group-hover:bg-muted/20"
                  style={{ width: totalGridWidth, minHeight: row.rowHeight }}
                >
                  <div className="pointer-events-none absolute inset-0 flex">
                    {monthDays.map((day) => {
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      return (
                        <div
                          key={formatISO(day)}
                          className={`h-full border-r border-border ${
                            isWeekend ? 'bg-muted/10' : ''
                          }`}
                          style={{ width: DAY_WIDTH }}
                        />
                      );
                    })}
                  </div>

                  {todayOffset >= 0 && (
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 z-10"
                      style={{
                        left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 - 1,
                        width: 2,
                        backgroundColor: '#ef4444',
                      }}
                    />
                  )}

                  {row.bars.map((task) => {
                    const visual = getTaskVisual(task);

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onTaskClick?.(task)}
                        className="absolute cursor-pointer rounded-xl border px-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                        style={{
                          left: task.startOffset * DAY_WIDTH + 4,
                          top: 20 + task.laneIndex * (BAR_HEIGHT + BAR_GAP),
                          width: task.span * DAY_WIDTH - 8,
                          height: BAR_HEIGHT,
                          background: visual.background,
                          borderColor: visual.border,
                          color: visual.text,
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        title={`${task.title} · ${formatShortDate(task._taskStart)} ~ ${formatShortDate(
                          task._taskEnd,
                        )}`}
                      >
                        <div className="flex w-full items-center justify-between gap-2 overflow-hidden">
                          <span className="truncate text-[11px] font-black">{task.title}</span>
                          <span className="shrink-0 rounded-full bg-black/5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter opacity-70">
                            {task.status === 'DONE'
                              ? 'Done'
                              : task.status === 'IN_PROGRESS'
                                ? 'Ing'
                                : 'Todo'}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {row.bars.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center whitespace-nowrap px-4 text-[10px] font-black uppercase italic tracking-widest text-muted-foreground/50">
                      No Tasks Assigned
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 border-t border-border bg-muted/50 px-8 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-background bg-muted shadow-sm"></span>
          Todo
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-background bg-blue-300 shadow-sm"></span>
          In Progress
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-background bg-gray-800 shadow-sm"></span>
          Done
        </div>
      </div>
    </div>
  );
}
