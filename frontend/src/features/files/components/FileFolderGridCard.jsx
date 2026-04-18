// import PropTypes from 'prop-types';
import FileTypeIcon from '@/features/files/assets/FileTypeIcon.jsx';

/**
 * 작업(Task) 단위 가상 폴더 전용 그리드 카드 컴포넌트.
 * - 선택/체크박스 대상이 아닌, 네비게이션 전용 폴더 카드입니다.
 * - FileGridCard와 레이아웃/크기를 최대한 맞추기 위해 "상단(아이콘) - 중간(텍스트) - 하단" 3단 구조를 유지합니다.
 *
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
      className="group flex h-full flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-center outline-none transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
    >
      {/* 상단 영역: 아이콘 (폴더 전용) */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
          <i className="ri-folder-3-fill text-4xl text-blue-500" />
        </div>

        {/* 중간 영역: 이름 + 항목 개수 */}
        <div className="w-full">
          <div className="line-clamp-1 px-2 text-lg font-semibold text-gray-900" title={title}>
            {title}
          </div>
          <div className="mt-1 text-sm font-medium text-gray-500">항목 {itemCount}개</div>
        </div>
      </div>
    </div>
  );
}

// FileFolderGridCard.propTypes = {
//   title: PropTypes.string.isRequired,
//   itemCount: PropTypes.number.isRequired,
//   footerMeta: PropTypes.string,
//   onClick: PropTypes.func,
// };
