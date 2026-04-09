import { useEffect, useRef } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import { LuDownload } from 'react-icons/lu';
import FileTypeIcon from './FileTypeIcon.jsx';
import { getFileExtension, getOwnerInitial } from '@/features/files/types/file.js';

/**
 * @typedef {Object} FileListItem
 * @property {string} uuid
 * @property {string} originalFilename
 * @property {number} size
 * @property {string} contentType
 * @property {string} createdDate
 * @property {string} createdBy
 * @property {string | null} [previewUrl]
 * @property {string | null} [downloadUrl]
 * @property {string} displaySize
 * @property {string} displayDate
 * @property {string} category
 * @property {string} [extensionLabel]
 * @property {number | null} [itemCount]
 */

/**
 * @typedef {Object} FileListTableProps
 * @property {FileListItem[]} items
 * @property {string[]} [selectedFileIds]
 * @property {(item: FileListItem) => void} [onToggleItemSelect]
 * @property {() => void} [onToggleAllSelect]
 * @property {(item: FileListItem) => void} [onDownloadItem]
 * @property {'size' | 'createdDate'} [sortKey]
 * @property {'asc' | 'desc'} [sortOrder]
 * @property {() => void} [onToggleSizeSort]
 * @property {() => void} [onToggleDateSort]
 */

/**
 * @param {FileListItem} item
 */
function getIconType(item) {
  const name = item.originalFilename.toLowerCase();

  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'ppt';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'excel';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.hwp')) return 'doc';
  if (item.contentType?.startsWith('image/')) return 'image';
  if (item.contentType?.startsWith('video/')) return 'video';

  return 'file';
}

/**
 * @param {string} filename
 * @param {string} contentType
 */
function getTypeIconStyle(filename = '', contentType = '') {
  const ext = getFileExtension(filename);

  if (contentType.startsWith('image/')) {
    return {
      icon: 'ri-image-2-line',
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      subLabel: ext ? ext.toUpperCase() : 'IMAGE',
    };
  }

  if (contentType.startsWith('video/')) {
    return {
      icon: 'ri-video-line',
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-50',
      subLabel: ext ? ext.toUpperCase() : 'VIDEO',
    };
  }

  if (ext === 'pdf') {
    return {
      icon: 'ri-file-pdf-line',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      subLabel: 'PDF',
    };
  }

  if (ext === 'ppt' || ext === 'pptx') {
    return {
      icon: 'ri-file-ppt-2-line',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      subLabel: ext.toUpperCase(),
    };
  }

  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
    return {
      icon: 'ri-file-excel-2-line',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      subLabel: ext.toUpperCase(),
    };
  }

  if (ext === 'doc' || ext === 'docx' || ext === 'hwp') {
    return {
      icon: 'ri-file-text-line',
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      subLabel: ext.toUpperCase(),
    };
  }

  if (ext === 'zip' || ext === 'rar') {
    return {
      icon: 'ri-file-zip-line',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subLabel: ext.toUpperCase(),
    };
  }

  return {
    icon: 'ri-file-line',
    iconColor: 'text-gray-500',
    bgColor: 'bg-gray-100',
    subLabel: ext ? ext.toUpperCase() : 'FILE',
  };
}

/**
 * @param {FileListTableProps} props
 */
export default function FileListTable({
  items,
  selectedFileIds = [],
  onToggleItemSelect,
  onToggleAllSelect,
  onDownloadItem,
  sortKey = 'createdDate',
  sortOrder = 'desc',
  onToggleSizeSort,
  onToggleDateSort,
}) {
  /** @type {import('react').MutableRefObject<HTMLInputElement | null>} */
  const headerCheckboxRef = useRef(null);
  const selectedItemCount = items.filter((item) => selectedFileIds.includes(item.uuid)).length;
  const allSelected = items.length > 0 && selectedItemCount === items.length;
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
      return <i className="ri-expand-up-down-line text-xs text-gray-300"></i>;
    }

    return sortOrder === 'desc' ? (
      <HiChevronDown className="text-base text-current" />
    ) : (
      <HiChevronUp className="text-base text-current" />
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="grid grid-cols-[44px_minmax(260px,2fr)_140px_180px_160px_96px] items-center border-b border-gray-200 bg-gray-50/80 px-6 py-4 text-sm font-semibold text-gray-500">
        <div className="flex items-center justify-center">
          <input
            ref={headerCheckboxRef}
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAllSelect}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label="전체 선택"
          />
        </div>
        <div>이름</div>
        <button
          type="button"
          onClick={onToggleSizeSort}
          className="inline-flex items-center gap-1 justify-self-start text-left text-sm font-semibold text-gray-500 transition hover:text-gray-700"
        >
          <span>크기</span>
          {renderSortIcon('size')}
        </button>
        <div>업로드한 사람</div>
        <button
          type="button"
          onClick={onToggleDateSort}
          className="inline-flex items-center gap-1 justify-self-start text-left text-sm font-semibold text-gray-500 transition hover:text-gray-700"
        >
          <span>업로드 날짜</span>
          {renderSortIcon('createdDate')}
        </button>
        <div className="text-center">다운로드</div>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-gray-400">
          표시할 파일이 없습니다.
        </div>
      ) : (
        items.map((item) => {
          const iconStyle = getTypeIconStyle(item.originalFilename, item.contentType);
          const isSelected = selectedFileIds.includes(item.uuid);

          return (
            <div
              key={item.uuid}
              className={`grid grid-cols-[44px_minmax(260px,2fr)_140px_180px_160px_96px] items-center border-b border-gray-100 px-6 py-5 transition hover:bg-gray-50/80 last:border-b-0 ${
                isSelected ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleItemSelect?.(item)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`${item.originalFilename} 선택`}
                />
              </div>

              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                  {item.previewUrl ? (
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
                  <div className="truncate text-lg font-semibold text-gray-900">
                    {item.originalFilename}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{iconStyle.subLabel}</div>
                </div>
              </div>

              <div className="text-sm font-medium text-gray-600">{item.displaySize}</div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 text-xs font-semibold text-white shadow-sm">
                  {getOwnerInitial(item.createdBy)}
                </div>
                <span className="truncate text-sm font-medium text-gray-700">
                  {item.createdBy}
                </span>
              </div>

              <div className="text-sm font-medium text-gray-600">{item.displayDate}</div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onDownloadItem?.(item)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                  title="다운로드"
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
