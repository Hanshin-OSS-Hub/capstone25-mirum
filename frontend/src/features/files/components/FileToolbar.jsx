import { useEffect, useRef, useState } from 'react';
import { fileCategory, fileViewMode } from '@/features/files/types/file.js';

const filterConfig = [
  { key: fileCategory.all, label: '전체', icon: 'ri-file-list-3-line' },
  // { key: fileCategory.folder, label: '폴더', icon: 'ri-folder-line' },
  { key: fileCategory.media, label: '미디어', icon: 'ri-image-2-line' },
  { key: fileCategory.document, label: '문서', icon: 'ri-file-text-line' },
];

export default function FileToolbar({
  searchKeyword,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
  viewMode,
  onViewModeChange,
  sortOrder,
  onSortOrderChange,
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* 1번째 줄: 오른쪽 상단 보기 토글 */}
      <div className="mb-4 flex justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">보기:</span>
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => onViewModeChange(fileViewMode.list)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === fileViewMode.list
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-list-check-2"></i>
              전체
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange(fileViewMode.grid)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === fileViewMode.grid
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-grid-line"></i>
              작업별
            </button>
          </div>
        </div>
      </div>

      {/* 2번째 줄: 왼쪽 필터 + 오른쪽 검색창 */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {filterConfig.map((item) => {
            const isActive = activeFilter === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onFilterChange(item.key)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className={`${item.icon} text-base`}></i>
                {item.label}

                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive ? 'bg-white text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {counts[item.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* 오른쪽: 긴 검색창 (원래 보기 토글 있던 자리) */}
        <div className="flex w-full justify-end lg:w-auto">
          <div className="w-full max-w-md">
            <div className="relative">
              <i className="ri-search-line pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400"></i>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="파일명으로 검색..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
