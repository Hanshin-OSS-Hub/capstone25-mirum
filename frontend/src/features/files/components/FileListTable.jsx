import { useEffect, useRef } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconExpandUpDown,
} from '@/shared/assets/icons.js';
import { UserProfileImg } from '@/shared/components/index.js';
import { getTypeIconStyle } from '../utils/filePresentation.js';
import FileTypeVisual from './FileTypeVisual.jsx';

/**
 * @typedef {import('@/types/file.js').FileListItem} FileListItem
 * @typedef {import('@/types/file.js').FileListTableProps} FileListTableProps
 */

/**
 * @param {FileListTableProps & { onSort?: (key: string) => void }} props
 */
export default function FileListTable({
  items,
  selectedFileIds = [],
  onToggleItemSelect,
  onToggleAllSelect,
  onDownloadItem,
  sortKey = 'uploadedDate',
  sortOrder = 'desc',
  onSort,
}) {
  /** @type {import('react').MutableRefObject<HTMLInputElement | null>} */
  const headerCheckboxRef = useRef(null);

  // 만료되지 않은 항목들만 선택 가능하도록 필터링
  const selectableItems = items.filter((item) => {
    if (!item.expiredDate) return true;
    return new Date(item.expiredDate) >= new Date();
  });

  const selectedItemCount = items.filter((item) => selectedFileIds.includes(item.uuid)).length;
  const allSelected = selectableItems.length > 0 && selectedItemCount === selectableItems.length;
  const hasSelection = selectedItemCount > 0;

  useEffect(() => {
    const headerCheckbox = headerCheckboxRef.current;
    if (headerCheckbox) {
      headerCheckbox.indeterminate = hasSelection && !allSelected;
    }
  }, [allSelected, hasSelection]);

  const renderSortIcon = (key) => {
    const isActive = sortKey === key;

    if (!isActive) {
      return <IconExpandUpDown size={14} className="ml-1 text-muted-foreground/40" />;
    }

    return sortOrder === 'desc' ? (
      <IconChevronDown size={16} className="ml-1 text-current" />
    ) : (
      <IconChevronUp size={16} className="ml-1 text-current" />
    );
  };

  const isItemExpired = (item) => {
    if (!item.expiredDate) return false;
    return new Date(item.expiredDate) < new Date();
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[44px_minmax(220px,2fr)_minmax(140px,1.4fr)_90px_170px_130px_96px] items-center border-b border-border bg-muted/50 px-4 py-3 text-sm font-semibold text-muted-foreground sm:px-6 sm:py-4">
          <div className="flex items-center justify-center">
            <input
              ref={headerCheckboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAllSelect}
              disabled={selectableItems.length === 0}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
              aria-label="전체 선택"
            />
          </div>

          <button
            type="button"
            onClick={() => onSort?.('name')}
            className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <span>이름</span>
            {renderSortIcon('name')}
          </button>

          <button
            type="button"
            onClick={() => onSort?.('taskName')}
            className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <span>작업명</span>
            {renderSortIcon('taskName')}
          </button>

          <button
            type="button"
            onClick={() => onSort?.('size')}
            className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <span>크기</span>
            {renderSortIcon('size')}
          </button>

          <button
            type="button"
            onClick={() => onSort?.('uploadedBy')}
            className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <span>업로드한 사람</span>
            {renderSortIcon('uploadedBy')}
          </button>

          <button
            type="button"
            onClick={() => onSort?.('uploadedDate')}
            className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <span>업로드 날짜</span>
            {renderSortIcon('uploadedDate')}
          </button>

          <div className="text-center">다운로드</div>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-6 sm:py-16">
            표시할 파일이 없습니다.
          </div>
        ) : (
          items.map((item) => {
            const iconStyle = getTypeIconStyle(item.originalFilename, item.contentType);
            const isSelected = selectedFileIds.includes(item.uuid);
            const expired = isItemExpired(item);

            return (
              <div
                key={item.uuid}
                className={`grid grid-cols-[44px_minmax(220px,2fr)_minmax(140px,1.4fr)_90px_170px_130px_96px] items-center border-b border-border px-4 py-3 transition last:border-b-0 hover:bg-muted/50 sm:px-6 sm:py-4 ${
                  isSelected ? 'bg-primary/10' : ''
                } ${expired ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={expired}
                    onChange={() => onToggleItemSelect?.(item)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`${item.originalFilename} 선택`}
                  />
                </div>

                <div className="flex min-w-0 items-center gap-4 pr-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                    <FileTypeVisual item={item} size="list" isExpired={expired} />
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`truncate text-base font-semibold leading-6 ${expired ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                    >
                      {item.originalFilename}
                    </div>
                    <div className="mt-0.5 text-sm leading-5 text-muted-foreground">
                      {iconStyle.subLabel}
                      {expired && <span className="ml-2 font-medium text-red-500">(만료됨)</span>}
                    </div>
                  </div>
                </div>

                <div className="truncate pr-4 text-sm font-medium text-muted-foreground">
                  {item.taskName ? item.taskName : item.taskId ? `작업 #${item.taskId}` : '-'}
                </div>

                <div className="text-sm font-medium text-muted-foreground">{item.displaySize}</div>

                <div className="flex items-center gap-2.5 pr-4">
                  <UserProfileImg name={item.uploadedBy} size="md" pendingInvite={expired} />
                  <span className="truncate text-sm font-medium text-foreground">
                    {item.uploadedBy}
                  </span>
                </div>

                <div className="pr-2 text-sm font-medium text-muted-foreground">
                  {item.displayDate}
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => onDownloadItem?.(item)}
                    disabled={expired || item.contentType === 'application/x-folder'}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                      expired || item.contentType === 'application/x-folder'
                        ? 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                        : 'border-primary/35 bg-primary/10 text-primary hover:border-primary/50 hover:bg-primary/20 hover:text-primary'
                    }`}
                    title={expired ? '만료된 파일입니다' : '다운로드'}
                  >
                    <IconDownload size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
