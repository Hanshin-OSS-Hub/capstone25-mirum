import { FILE_CATEGORY } from '@/constants/fileConstants.js';
import { IconFolderFill } from '@/shared/assets/icons.js';
import { getListTypeIconClasses, getTypeIconStyle } from '../utils/filePresentation.js';

/**
 * 파일 타입 아이콘을 리스트/그리드에서 공통 렌더링하는 컴포넌트
 * @param {{
 *   item: import('@/types/file.js').FileListItem,
 *   size?: 'list' | 'grid',
 *   variant?: 'default' | 'compact',
 *   isExpired?: boolean,
 * }} props
 */
export default function FileTypeVisual({
  item,
  size = 'list',
  variant = 'default',
  isExpired = false,
}) {
  const isFolder = item.category === FILE_CATEGORY.FOLDER;
  const isMediaWithPreview = item.category === FILE_CATEGORY.MEDIA && !!item.previewUrl;
  const iconStyle = getTypeIconStyle(item.originalFilename, item.contentType);
  const listIconClasses = getListTypeIconClasses(
    item.originalFilename,
    item.contentType,
    isExpired,
  );

  const isCompact = variant === 'compact';
  const listImageClass = isCompact
    ? 'h-8 w-8 rounded-md object-cover'
    : 'h-10 w-10 rounded-md object-cover';
  const listWrapperClass = isCompact ? 'h-8 w-8' : 'h-10 w-10';
  const listIconSize = isCompact ? 20 : 24;
  const gridImageClass = isCompact
    ? 'h-14 w-14 rounded-2xl object-cover shadow-sm'
    : 'h-16 w-16 rounded-2xl object-cover shadow-sm';
  const gridIconSize = isCompact ? 32 : 40;

  if (isMediaWithPreview && !isExpired) {
    return (
      <img
        src={item.previewUrl}
        alt={item.originalFilename}
        className={size === 'grid' ? gridImageClass : listImageClass}
      />
    );
  }

  if (size === 'grid') {
    if (isFolder) {
      return (
        <IconFolderFill
          size={gridIconSize}
          className="text-blue-500 transition-transform group-hover:scale-110"
        />
      );
    }
    return (
      <iconStyle.Icon
        size={gridIconSize}
        className={`${iconStyle.iconColor} transition-transform group-hover:scale-110`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${listWrapperClass} ${listIconClasses.wrapperClass}`}
    >
      <iconStyle.Icon size={listIconSize} className={listIconClasses.iconClass} />
    </div>
  );
}
