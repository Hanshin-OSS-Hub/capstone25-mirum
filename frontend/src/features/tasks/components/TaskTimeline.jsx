import { useMemo, useState } from 'react';

// import { taskStatus } from '@/features/tasks/types/task.js';

const DAY_WIDTH = 44;
const NAME_COL_WIDTH = 190;
const BAR_HEIGHT = 38;
const BAR_GAP = 10;
const ROW_BASE_HEIGHT = 82;

function parseDate(dateString) {
  if (!dateString) return null;
  return new Date(`${dateString}T00:00:00`);
}

function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date, days) {
  const copied = new Date(date);
  copied.setDate(copied.getDate() + days);
  return copied;
}

function getDaysInMonth(date) {
  return endOfMonth(date).getDate();
}

function clampDate(date, min, max) {
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

function differenceInDays(a, b) {
  const oneDay = 1000 * 60 * 60 * 24;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcA - utcB) / oneDay);
}

function intersectsMonth(taskStart, taskEnd, monthStart, monthEnd) {
  return taskStart <= monthEnd && taskEnd >= monthStart;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;

  const bigint = parseInt(full, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getTaskVisual(task) {
  const base = task.color || '#4F46E5';

  switch (task.status) {
    case 'DONE':
      return {
        background: `linear-gradient(135deg, ${rgba(base, 0.95)}, ${rgba(base, 0.82)})`,
        border: rgba(base, 1),
        text: '#ffffff',
        shadow: `0 10px 24px ${rgba(base, 0.25)}`,
      };

    case 'IN_PROGRESS':
      return {
        background: `linear-gradient(135deg, ${rgba(base, 0.26)}, ${rgba(base, 0.48)})`,
        border: rgba(base, 0.76),
        text: '#1f2937',
        shadow: `0 8px 18px ${rgba(base, 0.12)}`,
      };

    default:
      return {
        background: `linear-gradient(135deg, ${rgba(base, 0.14)}, ${rgba(base, 0.24)})`,
        border: rgba(base, 0.42),
        text: '#374151',
        shadow: 'none',
      };
  }
}

function formatMonthLabel(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function formatShortDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function buildLanes(tasks, monthStart, monthEnd) {
  const sorted = [...tasks]
    .map((task) => {
      const rawStart = parseDate(task.startDate || task.createdAt);
      const rawEnd = parseDate(task.dueDate || task.startDate || task.createdAt);

      if (!rawStart || !rawEnd) return null;

      const taskStart = rawStart <= rawEnd ? rawStart : rawEnd;
      const taskEnd = rawStart <= rawEnd ? rawEnd : rawStart;

      return {
        ...task,
        _taskStart: taskStart,
        _taskEnd: taskEnd,
      };
    })
    .filter(Boolean)
    .filter((task) => intersectsMonth(task._taskStart, task._taskEnd, monthStart, monthEnd))
    .sort((a, b) => a._taskStart - b._taskStart || a._taskEnd - b._taskEnd);

  const lanes = [];

  sorted.forEach((task) => {
    let laneIndex = 0;

    while (laneIndex < lanes.length) {
      const lastTask = lanes[laneIndex][lanes[laneIndex].length - 1];
      if (task._taskStart > lastTask._taskEnd) break;
      laneIndex += 1;
    }

    if (!lanes[laneIndex]) lanes[laneIndex] = [];
    lanes[laneIndex].push(task);
  });

  return lanes;
}

export default function TaskTimeline({ tasks = [], teamMembers = [], onTaskClick }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const datedTask = tasks.find((task) => task.startDate || task.dueDate || task.createdDate);
    return datedTask
      ? parseDate(datedTask.startDate || datedTask.dueDate || datedTask.createdDate) || new Date()
      : new Date();
  });

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
    return teamMembers.map((member) => {
      const memberTasks = tasks.filter((task) => task.assignee === member.name);
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
  }, [tasks, teamMembers, monthStart, monthEnd]);

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
            className="h-10 w-10 cursor-pointer rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            <i className="ri-arrow-left-s-line text-xl"></i>
          </button>

          <div className="min-w-[120px] text-center text-sm font-semibold text-gray-800">
            {formatMonthLabel(currentMonth)}
          </div>

          <button
            type="button"
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
            }
            className="h-10 w-10 cursor-pointer rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            <i className="ri-arrow-right-s-line text-xl"></i>
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
                      } ${isToday ? 'bg-blue-50' : ''}`}
                      style={{ width: DAY_WIDTH }}
                    >
                      <div className="text-[11px] text-gray-400">
                        {['일', '월', '화', '수', '목', '금', '토'][day.getDay()]}
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          isToday ? 'text-blue-700' : 'text-gray-800'
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
            <div key={row.member.id} className="flex border-b border-gray-100 last:border-b-0">
              <div
                className="flex shrink-0 items-start border-r border-gray-100 bg-white px-5 py-5"
                style={{ width: NAME_COL_WIDTH, minHeight: row.rowHeight }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-sm font-semibold text-white">
                    {(row.member.displayName || row.member.name).slice(0, 1)}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {row.member.displayName || row.member.name}
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
                  <div
                    className="pointer-events-none absolute bottom-0 top-0 z-10"
                    style={{
                      left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2,
                      width: 2,
                      background:
                        'linear-gradient(to bottom, rgba(37,99,235,0.16), rgba(37,99,235,0.7), rgba(37,99,235,0.16))',
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
                  <div className="absolute inset-0 flex items-center px-4 text-sm text-gray-300">
                    이번 달에 배치된 작업이 없습니다.
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
        <div className="text-gray-400">
          같은 작업 색상은 유지되고 상태에 따라 진하기만 달라집니다.
        </div>
      </div>
    </div>
  );
}
