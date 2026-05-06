import { useMemo } from 'react';
import { IconCalendar, IconCheck, IconFileList, IconRefresh } from '@/shared/assets/icons.js';

/**
 * 작업 상태 요약 카드 컴포넌트
 * @param {object} props
 * @param {{total: number, todo: number, inProgress: number, completed: number}} props.stats - 통계 데이터
 * @param {'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'} [props.activeFilter]
 * @param {(filter: 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE') => void} [props.onFilterChange]
 */
export default function TaskSummaryCard({ stats, activeFilter = 'ALL', onFilterChange }) {
  const summaryCards = useMemo(
    () => [
      {
        key: 'ALL',
        label: '전체 작업',
        value: stats.total,
        Icon: IconFileList,
        inactiveFrame: 'border-border bg-card',
        iconBox: 'bg-blue-500/15',
        iconColor: 'text-blue-600 dark:text-blue-400',
      },
      {
        key: 'TODO',
        label: '대기 중',
        value: stats.todo,
        Icon: IconCalendar,
        inactiveFrame: 'border-border bg-card',
        iconBox: 'bg-muted',
        iconColor: 'text-muted-foreground',
      },
      {
        key: 'IN_PROGRESS',
        label: '진행 중',
        value: stats.inProgress,
        Icon: IconRefresh,
        inactiveFrame: 'border-border bg-card',
        iconBox: 'bg-amber-500/15',
        iconColor: 'text-amber-600 dark:text-amber-400',
      },
      {
        key: 'DONE',
        label: '완료됨',
        value: stats.completed,
        Icon: IconCheck,
        inactiveFrame: 'border-border bg-card',
        iconBox: 'bg-emerald-500/15',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
      },
    ],
    [stats],
  );

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const { Icon } = card;
            const isActive = activeFilter === card.key;
            return (
              <button
                key={card.label}
                type="button"
                onClick={() => onFilterChange?.(card.key)}
                className={`flex min-h-[84px] w-full items-center justify-between rounded-xl border px-5 py-4 text-left shadow-sm transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/25'
                    : card.inactiveFrame
                } hover:bg-muted/60`}
              >
                <div className="flex min-w-0 items-center gap-3 pr-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base ${card.iconBox}`}
                  >
                    <Icon size={20} className={card.iconColor} />
                  </div>
                  <span className="truncate text-[14px] font-medium text-muted-foreground">
                    {card.label}
                  </span>
                </div>

                <span className="ml-auto text-[26px] font-semibold text-foreground">
                  {card.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
