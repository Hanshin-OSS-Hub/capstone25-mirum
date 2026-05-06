import { useEffect, useMemo, useState } from 'react';
import { FILE_CATEGORY, FILE_VIEW_MODE, FOLDER_CONTENT_TYPE } from '@/constants/fileConstants.js';
import { useDeleteFiles } from '@/features/files/api/useDeleteFiles.js';
import { useDownloadFiles } from '@/features/files/api/useDownloadFiles.js';
import { useGetProjectFiles } from '@/features/files/api/useGetProjectFiles.js';
import { useGetTaskList } from '@/features/tasks/api/useGetTaskList.js';
import FileGridCard from '@/features/files/components/FileGridCard.jsx';
import FileListTable from '@/features/files/components/FileListTable.jsx';
import FileToolbar from '@/features/files/components/FileToolbar.jsx';
import {
  IconArrowLeft,
  IconChevronRight,
  IconFileCopy,
  IconFolderFill,
  IconFolderOpen,
  IconFolders,
} from '@/shared/assets/icons.js';

/** @param {{ projectId: number | string }} props */
export default function FilePanel({ projectId }) {
  const {
    data: rawFiles = [],
    isLoading,
    isError,
    error,
    refetch: refetchFiles,
  } = useGetProjectFiles(projectId);
  const { data: tasks = [] } = useGetTaskList({ projectId: Number(projectId) });

  const { mutate: deleteFiles } = useDeleteFiles();
  const { mutate: downloadFilesApi } = useDownloadFiles();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState(FILE_CATEGORY.ALL);
  const [viewMode, setViewMode] = useState(FILE_VIEW_MODE.LIST);
  const [selectedFileIds, setSelectedFileIds] = useState(/** @type {string[]} */ ([]));
  const [sortKey, setSortKey] = useState(
    /** @type {'uploadedDate' | 'size' | 'name' | 'taskName' | 'uploadedBy'} */ ('uploadedDate'),
  );
  const [sortOrder, setSortOrder] = useState(/** @type {'desc' | 'asc'} */ ('desc'));

  // 탐색기 폴더 진입용 상태
  const [currentFolder, setCurrentFolder] = useState(/** @type {number | null} */ (null));

  useEffect(() => {
    setSelectedFileIds([]);
  }, [projectId]);

  // 보기 모드나 검색어가 바뀌면 탐색기 루트 위치로 돌아갑니다.
  useEffect(() => {
    setCurrentFolder(null);
  }, [viewMode, searchKeyword]);

  // rawFiles에 tasks 배열을 참조하여 taskName을 주입합니다.
  const files = useMemo(() => {
    if (tasks.length === 0) return rawFiles;

    return rawFiles.map((file) => {
      if (!file.taskId) return file;
      const matchedTask = tasks.find((t) => t.taskId === file.taskId);
      return {
        ...file,
        taskName: matchedTask ? matchedTask.title : '-',
      };
    });
  }, [rawFiles, tasks]);

  const counts = useMemo(() => {
    const folderCount = files.filter((item) => item.category === FILE_CATEGORY.FOLDER).length;
    const mediaCount = files.filter((item) => item.category === FILE_CATEGORY.MEDIA).length;
    const documentCount = files.filter((item) => item.category === FILE_CATEGORY.DOCUMENT).length;

    return {
      [FILE_CATEGORY.ALL]: files.length,
      [FILE_CATEGORY.FOLDER]: folderCount,
      [FILE_CATEGORY.MEDIA]: mediaCount,
      [FILE_CATEGORY.DOCUMENT]: documentCount,
    };
  }, [files]);

  const filteredFiles = useMemo(() => {
    let result = files;

    if (activeFilter !== FILE_CATEGORY.ALL) {
      result = result.filter((item) => item.category === activeFilter);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter((item) => item.originalFilename.toLowerCase().includes(keyword));
    }

    return result;
  }, [files, activeFilter, searchKeyword]);

  const sortedFiles = useMemo(() => {
    /** @param {any} item */
    const getTimeValue = (item) => {
      const timeValue = new Date(item.uploadedDate || 0).getTime();
      return Number.isNaN(timeValue) ? 0 : timeValue;
    };

    /** @param {any} item */
    const getSizeValue = (item) => {
      if (item.contentType === FOLDER_CONTENT_TYPE) return -1;
      return item.size || 0;
    };

    return [...filteredFiles].sort((left, right) => {
      let diff;
      switch (sortKey) {
        case 'size':
          diff = getSizeValue(left) - getSizeValue(right);
          break;
        case 'uploadedDate':
          diff = getTimeValue(left) - getTimeValue(right);
          break;
        case 'name':
          diff = (left.originalFilename || '').localeCompare(right.originalFilename || '');
          break;
        case 'taskName':
          diff = (left.taskName || String(left.taskId || '')).localeCompare(
            right.taskName || String(right.taskId || ''),
          );
          break;
        case 'uploadedBy':
          diff = (left.uploadedBy || '').localeCompare(right.uploadedBy || '');
          break;
        default:
          diff = 0;
      }
      return sortOrder === 'desc' ? -diff : diff;
    });
  }, [filteredFiles, sortKey, sortOrder]);

  // 그리드(작업별) 뷰를 위한 폴더 및 개별 파일 분리 로직
  const { taskFolders, standaloneFiles } = useMemo(() => {
    const groups = {};
    const standalone = [];

    sortedFiles.forEach((file) => {
      if (!file.taskId || file.taskName === '-') {
        standalone.push(file);
      } else {
        const key = Number(file.taskId);
        if (!groups[key]) {
          groups[key] = {
            taskId: key,
            taskName: file.taskName || `작업 #${file.taskId}`,
            files: [],
          };
        }
        groups[key].files.push(file);
      }
    });

    return { taskFolders: groups, standaloneFiles: standalone };
  }, [sortedFiles]);

  const selectedFiles = useMemo(
    () => files.filter((item) => selectedFileIds.includes(item.uuid)),
    [files, selectedFileIds],
  );

  const downloadableSelectedFiles = useMemo(
    () => selectedFiles.filter((item) => item.contentType !== FOLDER_CONTENT_TYPE),
    [selectedFiles],
  );

  const selectedCount = selectedFiles.length;
  const currentFolderFiles = useMemo(
    () => (currentFolder ? taskFolders[currentFolder]?.files || [] : []),
    [currentFolder, taskFolders],
  );
  const currentFolderSelectableIds = useMemo(
    () =>
      currentFolderFiles
        .filter((item) => !item.expiredDate || new Date(item.expiredDate) >= new Date())
        .map((item) => item.uuid),
    [currentFolderFiles],
  );
  const allCurrentFolderSelected =
    currentFolderSelectableIds.length > 0 &&
    currentFolderSelectableIds.every((uuid) => selectedFileIds.includes(uuid));

  /** @param {any} item */
  const downloadFile = (item) => {
    if (!item || item.contentType === FOLDER_CONTENT_TYPE) return;
    downloadFilesApi({ selectedFiles: [item] });
  };

  /** @param {any} item */
  const toggleFileSelection = (item) => {
    setSelectedFileIds((current) =>
      current.includes(item.uuid)
        ? current.filter((uuid) => uuid !== item.uuid)
        : [...current, item.uuid],
    );
  };

  const toggleVisibleSelection = () => {
    const selectableItems = sortedFiles.filter((item) => {
      if (!item.expiredDate) return true;
      return new Date(item.expiredDate) >= new Date();
    });

    const visibleIds = selectableItems.map((item) => item.uuid);
    const isEveryVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((uuid) => selectedFileIds.includes(uuid));

    setSelectedFileIds((current) => {
      if (isEveryVisibleSelected) {
        return current.filter((uuid) => !visibleIds.includes(uuid));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const clearSelection = () => setSelectedFileIds([]);

  const toggleCurrentFolderSelection = () => {
    if (currentFolderSelectableIds.length === 0) return;
    setSelectedFileIds((current) => {
      if (allCurrentFolderSelected) {
        return current.filter((uuid) => !currentFolderSelectableIds.includes(uuid));
      }
      return Array.from(new Set([...current, ...currentFolderSelectableIds]));
    });
  };

  const downloadSelectedFiles = () => {
    if (downloadableSelectedFiles.length === 0) return;

    // API 훅을 한 번만 호출하여 모든 선택된 파일을 다운로드
    downloadFilesApi({ selectedFiles: downloadableSelectedFiles });
  };

  const handleDeleteSelected = () => {
    if (selectedFileIds.length === 0) return;

    const shouldDelete = window.confirm('선택한 파일을 삭제하시겠습니까?');
    if (!shouldDelete) return;

    deleteFiles(
      { selectedFiles: selectedFiles, projectId: Number(projectId) },
      {
        onSuccess: () => {
          setSelectedFileIds([]);
        },
      },
    );
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortOrder('desc'); // 새로운 속성은 내림차순(최신/큰값 먼저)을 기본으로 함
    }
  };

  return (
    <div className="space-y-4">
      <FileToolbar
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedCount}
        clearSelection={clearSelection}
        downloadSelectedFiles={downloadSelectedFiles}
        handleDeleteSelected={handleDeleteSelected}
      />

      <div className="min-h-[500px] overflow-hidden rounded-[28px] border border-border bg-card shadow-sm sm:rounded-[40px]">
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex h-72 items-center justify-center text-muted-foreground">
              파일을 불러오는 중입니다...
            </div>
          ) : isError ? (
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-12 -top-10 h-44 w-44 rounded-full bg-blue-100/50 blur-3xl" />
                <div className="absolute -bottom-10 -right-12 h-48 w-48 rounded-full bg-indigo-100/50 blur-3xl" />
              </div>

              <div className="relative mx-auto max-w-xl">
                <div className="mb-3 text-6xl font-black tracking-[-0.04em] text-muted-foreground/20">
                  404
                </div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <IconFolderOpen size={28} />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  파일 데이터를 불러오지 못했습니다
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                  {error?.message || '파일 정보가 없거나 접근 권한이 없습니다.'}
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => refetchFiles()}
                    className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
                  >
                    다시 시도
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchKeyword('');
                      setActiveFilter(FILE_CATEGORY.ALL);
                      setCurrentFolder(null);
                    }}
                    className="rounded-2xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted/50 active:scale-95"
                  >
                    필터 초기화
                  </button>
                </div>
              </div>
            </section>
          ) : sortedFiles.length === 0 ? (
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-12 -top-10 h-44 w-44 rounded-full bg-blue-100/40 blur-3xl" />
                <div className="absolute -bottom-10 -right-12 h-48 w-48 rounded-full bg-indigo-100/40 blur-3xl" />
              </div>

              <div className="relative mx-auto max-w-xl">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <IconFolderOpen size={30} />
                </div>
                <p className="text-base font-medium text-muted-foreground">파일이 없습니다</p>
              </div>
            </section>
          ) : viewMode === FILE_VIEW_MODE.GRID ? (
            // 🔥 진짜 파일 탐색기 UX 렌더링
            currentFolder === null ? (
              // 1. 최상위 뷰 (가상 폴더 목록 + 개별 파일)
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* 1-1. 작업별 폴더 (폴더가 있을 때만 렌더링) */}
                {Object.keys(taskFolders).length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
                      <IconFolders size={20} className="text-primary" />
                      작업별 폴더
                    </h3>
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                      {Object.values(taskFolders).map((folder) => (
                        <button
                          key={folder.taskId}
                          type="button"
                          onClick={() => setCurrentFolder(folder.taskId)}
                          className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                        >
                          <IconFolderFill
                            size={60}
                            className="text-primary transition-transform group-hover:scale-110"
                          />
                          <div className="w-full text-center">
                            <p
                              className="w-full truncate px-2 font-semibold text-foreground"
                              title={folder.taskName}
                            >
                              {folder.taskName}
                            </p>
                            <p className="mt-1 text-xs font-medium text-muted-foreground">
                              항목 {folder.files.length}개
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-2. 개별 파일 (taskId가 없는 파일들) */}
                {standaloneFiles.length > 0 && (
                  <div>
                    <h3 className="mb-6 flex items-center gap-2 border-t border-border pt-8 text-lg font-bold text-foreground">
                      <IconFileCopy size={20} className="text-primary" />
                      공용 파일
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {standaloneFiles.map((item) => (
                        <FileGridCard
                          key={item.uuid}
                          item={item}
                          onDownload={downloadFile}
                          isSelected={selectedFileIds.includes(item.uuid)}
                          onToggleSelect={toggleFileSelection}
                          isExpired={Boolean(
                            item.expiredDate && new Date(item.expiredDate) < new Date(),
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 2. 폴더 내부 뷰 (해당 작업에 속한 파일들)
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {/* 빵판(Breadcrumb) 형태의 뒤로가기 헤더 */}
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setCurrentFolder(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-blue-200 hover:bg-card hover:text-blue-600 hover:shadow-md"
                    title="상위 폴더로 이동"
                  >
                    <IconArrowLeft size={18} />
                  </button>

                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className="cursor-pointer text-muted-foreground transition hover:text-foreground"
                      onClick={() => setCurrentFolder(null)}
                    >
                      전체 폴더
                    </span>
                    <IconChevronRight size={16} className="text-muted-foreground" />
                    <span className="text-foreground">
                      {taskFolders[currentFolder]?.taskName || '-'}
                    </span>
                  </div>

                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={toggleCurrentFolderSelection}
                      disabled={currentFolderSelectableIds.length === 0}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        allCurrentFolderSelected
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {allCurrentFolderSelected ? '파일 전체 선택 해제' : '파일 전체 선택'}
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full border border-primary/35 bg-primary/15 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-primary shadow-sm">
                    총 {taskFolders[currentFolder]?.files?.length || 0}개
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {currentFolderFiles.map((item) => (
                    <FileGridCard
                      key={item.uuid}
                      item={item}
                      onDownload={downloadFile}
                      isSelected={selectedFileIds.includes(item.uuid)}
                      onToggleSelect={toggleFileSelection}
                      isExpired={Boolean(
                        item.expiredDate && new Date(item.expiredDate) < new Date(),
                      )}
                    />
                  ))}
                </div>
              </div>
            )
          ) : (
            <FileListTable
              items={sortedFiles}
              selectedFileIds={selectedFileIds}
              onToggleItemSelect={toggleFileSelection}
              onToggleAllSelect={toggleVisibleSelection}
              onDownloadItem={downloadFile}
              sortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}
        </div>
      </div>
    </div>
  );
}
