import { FILE_CATEGORY, FILE_VIEW_MODE } from '@/constants/fileConstants.js';
import {
  IconClose,
  IconDownload,
  IconFileList,
  IconFileMedia,
  IconFileText,
  IconGridView,
  IconListView,
  IconSearch,
  IconTrash,
} from '@/shared/assets/icons.js';
import { Button, SearchInput } from '@/shared/components/ui/index.js';

const filterConfig = [
  { key: FILE_CATEGORY.ALL, label: '전체', Icon: IconFileList },
  { key: FILE_CATEGORY.MEDIA, label: '미디어', Icon: IconFileMedia },
  { key: FILE_CATEGORY.DOCUMENT, label: '문서', Icon: IconFileText },
];

/**
 * 파일 패널 상단 툴바 컴포넌트
 * @param props
 */
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
  } = props;

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* 1. 선택된 파일 액션 바 */}
      {selectedCount > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 to-indigo-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-primary/35">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-primary">
              <span className="rounded-full border border-primary/35 bg-card px-2 py-0.5 text-[11px] font-extrabold text-primary">
                {selectedCount}
              </span>
              선택된 파일
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={downloadSelectedFiles}
                size="sm"
                className="rounded-lg shadow-sm"
              >
                <IconDownload size={16} />
                일괄 다운로드
              </Button>

              <Button
                type="button"
                onClick={handleDeleteSelected}
                size="sm"
                variant="outline"
                className="rounded-lg border-red-200 text-red-600 hover:bg-red-500/15 hover:text-red-700 dark:border-red-500/40"
              >
                <IconTrash size={16} />
                일괄 삭제
              </Button>

              <Button
                type="button"
                onClick={clearSelection}
                size="sm"
                variant="outline"
                className="rounded-lg border-primary/35 px-3 text-primary hover:bg-primary/15"
              >
                <IconClose size={16} />
                선택 해제
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 필터 + 검색창 & 보기 토글 */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* 왼쪽: 필터 버튼들 */}
        <div className="flex flex-wrap items-center gap-3">
          {filterConfig.map((item) => {
            const isActive = activeFilter === item.key;
            const { Icon } = item;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onFilterChange(item.key)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition ${
                  isActive
                    ? 'border-primary/35 bg-primary/15 text-primary shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                {item.label}

                <span
                  className={`inline-flex min-w-[24px] items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold leading-none ${
                    isActive
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-gray-200 bg-white text-gray-500'
                  }`}
                >
                  {counts[item.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* 오른쪽: 검색창 + 보기 모드 */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto xl:justify-end">
          {/* 검색창 */}
          <div className="w-full sm:max-w-md xl:w-72">
            <SearchInput
              icon={IconSearch}
              type="text"
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="파일명으로 검색..."
              inputClassName="h-10"
            />
          </div>

          {/* 보기 모드 (List / Grid) */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="inline-flex h-10 items-center rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => onViewModeChange(FILE_VIEW_MODE.LIST)}
                className={`inline-flex h-full items-center gap-2 rounded-lg px-4 text-sm font-bold transition ${
                  viewMode === FILE_VIEW_MODE.LIST
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconListView size={16} />
                전체
              </button>

              <button
                type="button"
                onClick={() => {
                  clearSelection();
                  onViewModeChange(FILE_VIEW_MODE.GRID);
                }}
                className={`inline-flex h-full items-center gap-2 rounded-lg px-4 text-sm font-bold transition ${
                  viewMode === FILE_VIEW_MODE.GRID
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconGridView size={16} />
                작업별
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
