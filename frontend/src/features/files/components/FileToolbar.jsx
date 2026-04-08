import { useEffect, useRef, useState } from 'react';
import { fileCategory, fileViewMode } from '@/features/files/types/file.js';

const filterConfig = [
  { key: fileCategory.all, label: '전체', icon: 'ri-file-list-3-line' },
  { key: fileCategory.folder, label: '폴더', icon: 'ri-folder-line' },
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full lg:max-w-md">
          <div className="relative">
            <i className="ri-search-line pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400"></i>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="파일명으로 검색..."
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-300"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="relative" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <i className={`ri-arrow-${sortOrder === 'desc' ? 'down' : 'up'}-s-line text-base text-gray-500`}></i>
              <span>정렬</span>
              <i className={`ri-arrow-${isSortOpen ? 'up' : 'down'}-s-line text-base text-gray-400`}></i>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    onSortOrderChange?.('desc');
                    setIsSortOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition hover:bg-gray-50 ${
                    sortOrder === 'desc' ? 'text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <i className="ri-arrow-down-s-line text-base"></i>
                  최신순
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSortOrderChange?.('asc');
                    setIsSortOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition hover:bg-gray-50 ${
                    sortOrder === 'asc' ? 'text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <i className="ri-arrow-up-s-line text-base"></i>
                  오래된 순
                </button>
              </div>
            )}
          </div>

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
              목록
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
              그리드
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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
    </div>
  );
}
