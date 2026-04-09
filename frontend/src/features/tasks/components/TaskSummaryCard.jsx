import { useMemo } from 'react';

export default function TaskSummaryCard({ stats }) {
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

  return (
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

              <span className="ml-auto text-[26px] font-semibold text-[#111827]">{card.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
