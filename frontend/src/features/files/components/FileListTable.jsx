import { useEffect, useRef } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import { LuDownload } from 'react-icons/lu';
import FileTypeIcon from '../assets/FileTypeIcon.jsx';
import { getIconType, getOwnerInitial, getTypeIconStyle } from '../utils/filePresentation.js';

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
      return <i className="ri-expand-up-down-line ml-1 text-xs text-gray-300"></i>;
    }

    return sortOrder === 'desc' ? (
      <HiChevronDown className="ml-1 text-base text-current" />
    ) : (
      <HiChevronUp className="ml-1 text-base text-current" />
    );
  };

  const isItemExpired = (item) => {
    if (!item.expiredDate) return false;
    return new Date(item.expiredDate) < new Date();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="grid grid-cols-[44px_minmax(200px,2fr)_minmax(120px,1.5fr)_100px_140px_140px_96px] items-center border-b border-gray-200 bg-gray-50/80 px-6 py-4 text-sm font-semibold text-gray-500">
        <div className="flex items-center justify-center">
          <input
            ref={headerCheckboxRef}
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAllSelect}
            disabled={selectableItems.length === 0}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            aria-label="전체 선택"
          />
        </div>

        <button
          type="button"
          onClick={() => onSort?.('name')}
          className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-gray-500 transition hover:text-gray-700"
        >
          <span>이름</span>
          {renderSortIcon('name')}
        </button>

        <button
          type="button"
          onClick={() => onSort?.('taskName')}
          className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-gray-500 transition hover:text-gray-700"
        >
          <span>작업명</span>
          {renderSortIcon('taskName')}
        </button>

        <button
          type="button"
          onClick={() => onSort?.('size')}
          className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-gray-500 transition hover:text-gray-700"
        >
          <span>크기</span>
          {renderSortIcon('size')}
        </button>

        <button
          type="button"
          onClick={() => onSort?.('uploadedBy')}
          className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-gray-500 transition hover:text-gray-700"
        >
          <span>업로드한 사람</span>
          {renderSortIcon('uploadedBy')}
        </button>

        <button
          type="button"
          onClick={() => onSort?.('uploadedDate')}
          className="inline-flex items-center justify-self-start text-left text-sm font-semibold text-gray-500 transition hover:text-gray-700"
        >
          <span>업로드 날짜</span>
          {renderSortIcon('uploadedDate')}
        </button>

        <div className="text-center">다운로드</div>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-gray-400">표시할 파일이 없습니다.</div>
      ) : (
        items.map((item) => {
          const iconStyle = getTypeIconStyle(item.originalFilename, item.contentType);
          const isSelected = selectedFileIds.includes(item.uuid);
          const expired = isItemExpired(item);

          return (
            <div
              key={item.uuid}
              className={`grid grid-cols-[44px_minmax(200px,2fr)_minmax(120px,1.5fr)_100px_140px_140px_96px] items-center border-b border-gray-100 px-6 py-5 transition last:border-b-0 hover:bg-gray-50/80 ${
                isSelected ? 'bg-blue-50/40' : ''
              } ${expired ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={expired}
                  onChange={() => onToggleItemSelect?.(item)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`${item.originalFilename} 선택`}
                />
              </div>

              <div className="flex min-w-0 items-center gap-4 pr-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                  {item.previewUrl && !expired ? (
                    <img
                      src={item.previewUrl}
                      alt={item.originalFilename}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <FileTypeIcon type={getIconType(item)} className="h-9 w-9" />
                  )}
                </div>

                <div className="min-w-0">
                  <div
                    className={`truncate text-lg font-semibold ${expired ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                  >
                    {item.originalFilename}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {iconStyle.subLabel}
                    {expired && <span className="ml-2 font-medium text-red-500">(만료됨)</span>}
                  </div>
                </div>
              </div>

              <div className="truncate pr-4 text-sm font-medium text-gray-600">
                {item.taskName ? item.taskName : item.taskId ? `작업 #${item.taskId}` : '-'}
              </div>

              <div className="text-sm font-medium text-gray-600">{item.displaySize}</div>

              <div className="flex items-center gap-3 pr-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm ${expired ? 'bg-gray-400' : 'bg-violet-500'}`}
                >
                  {getOwnerInitial(item.uploadedBy)}
                </div>
                <span className="truncate text-sm font-medium text-gray-700">
                  {item.uploadedBy}
                </span>
              </div>

              <div className="pr-2 text-sm font-medium text-gray-600">{item.displayDate}</div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onDownloadItem?.(item)}
                  disabled={expired || item.contentType === 'application/x-folder'}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    expired || item.contentType === 'application/x-folder'
                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                      : 'border-blue-100 bg-blue-50 text-blue-600 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                  title={expired ? '만료된 파일입니다' : '다운로드'}
                >
                  <LuDownload className="text-xl" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
