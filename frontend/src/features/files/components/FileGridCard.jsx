import { FILE_CATEGORY } from '@/constants/fileConstants.js';
import { IconDownload } from '@/shared/assets/icons.js';
import { UserProfileImg } from '@/shared/components/index.js';
import {
  getCategoryBadgeClass,
  getCategoryLabel,
  getTypeIconStyle,
} from '../utils/filePresentation.js';
import FileTypeVisual from './FileTypeVisual.jsx';

/**
 * @param {{
 *  item: import('@/types/file.js').FileListItem,
 *  onDownload?: (item: import('@/types/file.js').FileListItem) => void,
 *  isSelected?: boolean,
 *  onToggleSelect?: (item: import('@/types/file.js').FileListItem) => void,
 *  isExpired?: boolean
 * }} props
 */
export default function FileGridCard({
  item,
  onDownload,
  isSelected = false,
  onToggleSelect,
  isExpired = false,
}) {
  const isFolder = item.category === FILE_CATEGORY.FOLDER;
  const iconStyle = getTypeIconStyle(item.originalFilename, item.contentType);
  const isDownloadDisabled = isExpired || item.contentType === 'application/x-folder';

  return (
    <div
      className={`group rounded-[32px] border bg-card p-6 transition-all ${
        isSelected
          ? 'border-primary shadow-md shadow-primary/10 ring-1 ring-primary/20'
          : 'border-border hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl'
      } ${isExpired ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted transition-colors group-hover:bg-primary/10">
          <FileTypeVisual item={item} size="grid" />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(
              item.category,
            )}`}
          >
            {getCategoryLabel(item.category)}
          </span>
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              aria-label={`${item.originalFilename} 선택`}
              title="파일 선택"
            />
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="line-clamp-1 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
          {item.originalFilename}
        </div>

        <div className="mt-1 text-xs font-semibold text-muted-foreground">
          {isFolder
            ? `항목 ${item.itemCount ?? 0}개`
            : `${iconStyle.subLabel} · ${item.displaySize}`}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <UserProfileImg name={item.uploadedBy} size="sm" />
            <span className="truncate text-xs font-bold text-muted-foreground">
              {item.uploadedBy}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
              {item.displayDate}
            </span>
            <button
              type="button"
              onClick={() => onDownload?.(item)}
              disabled={isDownloadDisabled}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                isDownloadDisabled
                  ? 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                  : 'border-primary/35 bg-primary/10 text-primary hover:border-primary/50 hover:bg-primary/20'
              }`}
              title={isDownloadDisabled ? '다운로드할 수 없습니다' : '다운로드'}
            >
              <IconDownload size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
