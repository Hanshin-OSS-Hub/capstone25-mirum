import { IconFileCopy, IconFolder, IconHardDrive, IconTeam } from '@/shared/assets/icons.js';
import AnimatedBarFill from '@/shared/components/AnimatedBarFill.jsx';

/**
 * @param {{ totalFiles: number, folderCount: number, totalUsageText: string, ownerCount: number }} props
 */
export default function FileSummaryCards({ totalFiles, folderCount, totalUsageText, ownerCount }) {
  const cards = [
    {
      title: '전체 파일',
      value: totalFiles,
      Icon: IconFileCopy,
      iconBox: 'bg-blue-500/15',
      iconColor: 'text-blue-600 dark:text-blue-400',
      barClass: 'bg-blue-500 opacity-80',
      barPct: Math.min(100, 12 + Math.min(totalFiles, 48) * 1.5),
    },
    {
      title: '폴더',
      value: folderCount,
      Icon: IconFolder,
      iconBox: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      barClass: 'bg-emerald-500 opacity-80',
      barPct: Math.min(100, 18 + folderCount * 14),
    },
    {
      title: '사용 용량',
      value: totalUsageText,
      Icon: IconHardDrive,
      iconBox: 'bg-purple-500/15',
      iconColor: 'text-purple-600 dark:text-purple-400',
      barClass: 'bg-purple-500 opacity-80',
      barPct: 52,
    },
    {
      title: '공유자',
      value: ownerCount,
      Icon: IconTeam,
      iconBox: 'bg-orange-500/15',
      iconColor: 'text-orange-600 dark:text-orange-400',
      barClass: 'bg-orange-500 opacity-80',
      barPct: Math.min(100, 22 + ownerCount * 18),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const { Icon } = card;
        return (
          <div
            key={card.title}
            className="rounded-[32px] border border-border bg-card px-6 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconBox}`}
              >
                <Icon size={24} className={card.iconColor} />
              </div>

              <div className="flex flex-1 flex-col items-end text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {card.title}
                </div>
                <div className="mt-1 text-2xl font-black leading-none text-foreground">
                  {card.value}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <AnimatedBarFill
                targetPercent={card.barPct}
                durationMs={1100}
                trackClassName="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                barClassName={`rounded-full ${card.barClass}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
