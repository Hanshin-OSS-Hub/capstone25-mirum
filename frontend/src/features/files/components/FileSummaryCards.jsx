/**
 * @param {{ totalFiles: number, folderCount: number, totalUsageText: string, ownerCount: number }} props
 */
export default function FileSummaryCards({ totalFiles, folderCount, totalUsageText, ownerCount }) {
  const cards = [
    {
      title: '전체 파일',
      value: totalFiles,
      icon: 'ri-file-copy-2-line',
      iconBox: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: '폴더',
      value: folderCount,
      icon: 'ri-folder-line',
      iconBox: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: '사용 용량',
      value: totalUsageText,
      icon: 'ri-hard-drive-3-line',
      iconBox: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: '공유자',
      value: ownerCount,
      icon: 'ri-team-line',
      iconBox: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-50">
              <i className={`${card.icon} text-xl ${card.iconColor}`}></i>
            </div>

            <div className="ml-auto flex min-w-0 flex-1 flex-col items-end text-right">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
                {card.title}
              </div>
              <div className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.03em] text-gray-900">
                {card.value}
              </div>
            </div>
          </div>

          <div className="mt-4 h-1.5 rounded-full bg-gray-100">
            <div className={`h-1.5 rounded-full ${card.iconBox.replace('bg-', 'bg-')}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
