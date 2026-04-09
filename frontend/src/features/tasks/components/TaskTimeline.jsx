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

export default function TaskTimeline({ tasks = [], members: members = [], onTaskClick }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [autoAligned, setAutoAligned] = useState(false);
  // // tasks가 로드된 뒤, 최초 한 번 현재 월을 task의 날짜에 맞춰 보정
  // // (예: mock 데이터가 과거/미래에 있어도 해당 달로 자동 스크롤)
  // if (tasks.length > 0) {
  //   const datedTask = tasks.find((task) => task.startDate || task.dueDate || task.createdAt);
  //   const baseDate =
  //     datedTask && parseDate(datedTask.startDate || datedTask.dueDate || datedTask.createdAt);
  //   if (baseDate && !Number.isNaN(baseDate.getTime())) {
  //     const baseMonth = startOfMonth(baseDate);
  //     if (
  //       currentMonth.getFullYear() === new Date().getFullYear() &&
  //       currentMonth.getMonth() === new Date().getMonth()
  //     ) {
  //       // 초기값이 아직 오늘 기준인 경우에만 보정 적용
  //       // (사용자가 화살표로 월을 이동한 뒤에는 유지)
  //
  //       setCurrentMonth(baseMonth);
  //     }
  //   }
  // }

  useEffect(() => {
    if (autoAligned) return;
    if (tasks.length === 0) return;

    const datedTask = tasks.find((task) => task.startDate || task.dueDate || task.createdDate);
    const baseDate =
      datedTask && parseDate(datedTask.startDate || datedTask.dueDate || datedTask.createdDate);

    if (!baseDate || Number.isNaN(baseDate.getTime())) return;

    const baseMonth = startOfMonth(baseDate);
    const today = new Date();
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
    console.log('[TaskTimeline] tasks:', tasks);
    console.log('[TaskTimeline] members:', members);

    return members.map((member) => {
      const memberTasks = tasks.filter((task) => task.assigneeId === member.username);
      console.log('[TaskTimeline] member:', member);
      console.log('[TaskTimeline] memberTasks:', memberTasks);
      const lanes = buildLanes(memberTasks, monthStart, monthEnd);
      console.log('[TaskTimeline] lanes for', member.username, ':', lanes);

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

      console.log('[TaskTimeline] bars for', member.username, ':', laneBars);

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
    <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">
        <div>
          <h2 className="text-[24px] font-bold text-gray-900">팀 진행 타임라인</h2>
          <p className="mt-1 text-sm text-gray-500">
            작업 기간과 완료 상태를 사람별로 한눈에 볼 수 있어요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
            }
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            {/*<i className="ri-arrow-left-s-line text-xl"></i>*/}
            <IconChevronLeft className="text-xl" />
          </button>

          <div className="min-w-[120px] text-center text-sm font-semibold text-gray-800">
            {formatMonthLabel(currentMonth)}
          </div>

          <button
            type="button"
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
            }
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            {/*<i className="ri-arrow-right-s-line text-xl"></i>*/}
            <IconChevronRight className="text-xl" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max" style={{ width: NAME_COL_WIDTH + totalGridWidth }}>
          <div className="sticky top-0 z-20 flex border-b border-gray-100 bg-white">
            <div
              className="shrink-0 border-r border-gray-100 bg-white px-5 py-4"
              style={{ width: NAME_COL_WIDTH }}
            >
              <div className="text-sm font-semibold text-gray-800">팀원</div>
            </div>

            <div className="relative shrink-0" style={{ width: totalGridWidth }}>
              <div className="flex">
                {monthDays.map((day) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isToday = isCurrentMonth && day.getDate() === today.getDate();

                  return (
                    <div
                      key={formatISO(day)}
                      className={`flex h-[70px] flex-col items-center justify-center border-r border-gray-100 ${
                        isWeekend ? 'bg-gray-50/80' : 'bg-white'
                      } ${isToday ? 'bg-red-50' : ''}`}
                      style={{ width: DAY_WIDTH }}
                    >
                      <div className="text-[11px] text-gray-400">
                        {['일', '월', '화', '수', '목', '금', '토'][day.getDay()]}
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          isToday ? 'text-red-700' : 'text-gray-800'
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
              className="flex border-b border-gray-100 last:border-b-0"
            >
              <div
                className="flex shrink-0 items-start border-r border-gray-100 bg-white px-5 py-5"
                style={{ width: NAME_COL_WIDTH, minHeight: row.rowHeight }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-sm font-semibold text-white">
                    {(row.member.displayName || row.member.username).slice(0, 1)}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {row.member.displayName || row.member.username}
                    </div>
                    <div className="truncate text-xs text-gray-500">{row.member.role}</div>
                  </div>
                </div>
              </div>

              <div
                className="relative shrink-0"
                style={{ width: totalGridWidth, minHeight: row.rowHeight }}
              >
                <div className="pointer-events-none absolute inset-0 flex">
                  {monthDays.map((day) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return (
                      <div
                        key={formatISO(day)}
                        className={`h-full border-r border-gray-100 ${
                          isWeekend ? 'bg-gray-50/70' : 'bg-white'
                        }`}
                        style={{ width: DAY_WIDTH }}
                      />
                    );
                  })}
                </div>

                {todayOffset >= 0 && (
                  <>
                    {/* 소프트 글로우 (거의 투명한 pure red) */}
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 z-10"
                      style={{
                        left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 - 1,
                        width: 4,
                        background:
                          'linear-gradient(to bottom, rgba(255,0,0,0.04), rgba(255,0,0,0.16), rgba(255,0,0,0.04))',
                      }}
                    />
                    {/* 중앙 얇은 라인 (윗부분은 살짝 연한 red, 아래는 pure red에 근접) */}
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 z-20"
                      style={{
                        left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2,
                        width: 2,
                        background:
                          'linear-gradient(to bottom, rgba(255,80,80,1), rgba(255,0,0,1))',
                      }}
                    />
                  </>
                )}

                {row.bars.map((task) => {
                  const visual = getTaskVisual(task);

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onTaskClick?.(task)}
                      className="absolute cursor-pointer rounded-full border px-3 text-left transition-transform duration-150 hover:-translate-y-0.5"
                      style={{
                        left: task.startOffset * DAY_WIDTH + 4,
                        top: 20 + task.laneIndex * (BAR_HEIGHT + BAR_GAP),
                        width: task.span * DAY_WIDTH - 8,
                        height: BAR_HEIGHT,
                        background: visual.background,
                        borderColor: visual.border,
                        color: visual.text,
                        boxShadow: visual.shadow,
                      }}
                      title={`${task.title} · ${formatShortDate(task._taskStart)} ~ ${formatShortDate(
                        task._taskEnd,
                      )}`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold">{task.title}</span>
                        <span className="whitespace-nowrap text-[10px] opacity-90">
                          {task.status === 'DONE'
                            ? '완료'
                            : task.status === 'IN_PROGRESS'
                              ? '진행'
                              : '대기'}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {row.bars.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center whitespace-nowrap px-4 text-xs font-semibold text-gray-300">
                    배정된 작업이 없습니다.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 bg-gray-50 px-6 py-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="h-4 w-4 rounded-full border border-gray-300 bg-gray-200/60"></span>
          대기
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="h-4 w-4 rounded-full border border-gray-300 bg-gray-400/40"></span>
          진행중
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="h-4 w-4 rounded-full bg-gray-700"></span>
          완료
        </div>
        <div className="text-gray-400"> 작업 진행도에 따라 색이 점점 진해져요. </div>
      </div>
    </div>
  );
}
