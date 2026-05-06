import { IconFolderFill } from '@/shared/assets/icons.js';

/**
 * 작업(Task) 단위 가상 폴더 전용 그리드 카드 컴포넌트.
 * @param {{
 *   title: string; // 폴더(작업명) 제목
 *   itemCount: number; // 폴더 안 항목 개수
 *   onClick?: () => void;
 * }} props
 */
export default function FileFolderGridCard(props) {
  const { title, itemCount, onClick } = props;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className="group flex h-full flex-col items-center justify-between gap-3 rounded-[32px] border border-gray-100 bg-white p-8 text-center outline-none transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
    >
      {/* 상단 영역: 아이콘 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-blue-50 shadow-inner transition-colors group-hover:bg-blue-100">
          <IconFolderFill
            size={48}
            className="text-blue-600 transition-transform group-hover:scale-110"
          />
        </div>

        {/* 중간 영역: 이름 + 항목 개수 */}
        <div className="w-full">
          <div
            className="line-clamp-1 px-2 text-lg font-black text-gray-900 transition-colors group-hover:text-blue-600"
            title={title}
          >
            {title}
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
            항목 {itemCount}개
          </div>
        </div>
      </div>
    </div>
  );
}
