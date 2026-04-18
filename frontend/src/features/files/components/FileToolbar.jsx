import { useEffect, useRef, useState } from 'react';
import { fileCategory, fileViewMode } from '@/types/file.js';

const filterConfig = [
  { key: fileCategory.all, label: '전체', icon: 'ri-file-list-3-line' },
  // { key: fileCategory.folder, label: '폴더', icon: 'ri-folder-line' },
  { key: fileCategory.media, label: '미디어', icon: 'ri-image-2-line' },
  { key: fileCategory.document, label: '문서', icon: 'ri-file-text-line' },
];

export default function FileToolbar(props) {
  const {
    searchKeyword,
    onSearchChange,
    activeFilter,
    onFilterChange,
    counts,
    viewMode,
    onViewModeChange,
    selectedCount,
    clearSelection,
    downloadSelectedFiles,
    handleDeleteSelected,
    sortOrder,
    onSortOrderChange,
  } = props;
  // const [isSortOpen, setIsSortOpen] = useState(false);
  // const sortMenuRef = useRef(null);
  //
  // useEffect(() => {
  //   const handlePointerDown = (event) => {
  //     if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
  //       setIsSortOpen(false);
  //     }
  //   };
  //
  //   document.addEventListener('mousedown', handlePointerDown);
  //   return () => document.removeEventListener('mousedown', handlePointerDown);
  // }, []);

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* 1. 선택된 파일 액션 바 (선택된 항목이 있을 때만 맨 위에 나타남) */}
      {selectedCount > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-medium text-blue-800">
              선택된 파일 <span className="font-bold">{selectedCount}</span>개
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
              >
                <i className="ri-close-line text-base"></i>
                선택 해제
              </button>

              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
              >
                <i className="ri-delete-bin-line text-base"></i>
                삭제
              </button>

              <button
                type="button"
                onClick={downloadSelectedFiles}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                <i className="ri-download-2-line text-base"></i>
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 필터 + 검색창 & 보기 토글 (항상 아래에 위치) */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* 왼쪽: 필터 버튼들 */}
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

        {/* 오른쪽: 검색창 + 보기 모드 (나란히 배치) */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto xl:justify-end">
          {/* 검색창 */}
          <div className="w-full sm:max-w-md xl:w-72">
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

          {/* 보기 모드 (List / Grid) */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="inline-flex h-10 items-center rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => onViewModeChange(fileViewMode.list)}
                className={`inline-flex h-full items-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
                  viewMode === fileViewMode.list
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <i className="ri-list-check-2"></i>
                전체
              </button>

              <button
                type="button"
                onClick={() => {
                  clearSelection();
                  onViewModeChange(fileViewMode.grid);
                }}
                className={`inline-flex h-full items-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
                  viewMode === fileViewMode.grid
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <i className="ri-grid-line"></i>
                작업별
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
