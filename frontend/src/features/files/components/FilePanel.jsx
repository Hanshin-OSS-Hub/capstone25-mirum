import { useEffect, useMemo, useState } from 'react';
import { fileCategory, fileViewMode, folderContentType } from '@/types/file.js';
import { useDeleteFiles } from '@/features/files/api/useDeleteFiles.js';
import { useDownloadFiles } from '@/features/files/api/useDownloadFiles.js';
import { useUploadFiles } from '@/features/files/api/useUploadFiles.js';
import FileFolderGridCard from '@/features/files/components/FileFolderGridCard.jsx';
import FileGridCard from '@/features/files/components/FileGridCard.jsx';
import FileListTable from '@/features/files/components/FileListTable.jsx';
import FileToolbar from '@/features/files/components/FileToolbar.jsx';

/** @param {{ tasks: any[]; projectId: number | string }} props */
export default function FilePanel(props) {
  const { tasks, projectId, rawFiles } = props;
  // const { data: rawFiles = [], isLoading } = useGetProjectFiles(projectId);
  const { mutate: deleteFiles } = useDeleteFiles();
  const { mutate: downloadFiles } = useDownloadFiles();
  // 업로드 버튼의 onClick에 uploadFiles를 달면 됨
  const { mutate: uploadFiles } = useUploadFiles();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState(fileCategory.all);
  const [viewMode, setViewMode] = useState(fileViewMode.list);
  const [selectedFileIds, setSelectedFileIds] = useState(/** @type {string[]} */ ([]));
  const [sortKey, setSortKey] = useState(
    /** @type {'uploadedDate' | 'size' | 'name' | 'taskName' | 'uploadedBy'} */ ('uploadedDate'),
  );
  const [sortOrder, setSortOrder] = useState(/** @type {'desc' | 'asc'} */ ('desc'));

  // 탐색기 폴더 진입용 상태
  const [currentFolder, setCurrentFolder] = useState(/** @type {string | null} */ (null));

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
    const folderCount = files.filter((item) => item.category === fileCategory.folder).length;
    const mediaCount = files.filter((item) => item.category === fileCategory.media).length;
    const documentCount = files.filter((item) => item.category === fileCategory.document).length;

    return {
      [fileCategory.all]: files.length,
      [fileCategory.folder]: folderCount,
      [fileCategory.media]: mediaCount,
      [fileCategory.document]: documentCount,
    };
  }, [files]);

  const filteredFiles = useMemo(() => {
    let result = files;

    if (activeFilter !== fileCategory.all) {
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
      if (item.contentType === folderContentType) return -1;
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
        const key = file.taskName || `작업 #${file.taskId}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(file);
      }
    });

    return { taskFolders: groups, standaloneFiles: standalone };
  }, [sortedFiles]);

  const selectedFiles = useMemo(
    () => files.filter((item) => selectedFileIds.includes(item.uuid)),
    [files, selectedFileIds],
  );

  const downloadableSelectedFiles = useMemo(
    () => selectedFiles.filter((item) => item.contentType !== folderContentType),
    [selectedFiles],
  );

  const selectedCount = selectedFiles.length;

  /** @param {any} item */
  const downloadFile = (item) => {
    if (!item || item.contentType === folderContentType) return;

    // 백엔드 연동 전의 임시 다운로드 로직 (프리뷰 URL로 이동하거나 더미 데이터 생성)
    // const href = item.downloadUrl || item.previewUrl;
    // const fallbackText = `파일명: ${item.originalFilename}\n크기: ${item.displaySize}\n업로드한 사람: ${item.createdBy}`;
    // const downloadHref =
    //   href || `data:text/plain;charset=utf-8,${encodeURIComponent(fallbackText)}`;
    //
    // const link = document.createElement('a');
    // link.href = downloadHref;
    // link.download = item.originalFilename || 'download';
    // link.rel = 'noopener';
    // document.body.appendChild(link);
    // link.click();
    // link.remove();

    // S3 연동된 실제 API 훅 사용
    downloadFiles({ selectedFiles: [item] });
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

  const downloadSelectedFiles = () => {
    // downloadableSelectedFiles.forEach(downloadFile);
    if (downloadableSelectedFiles.length === 0) return;

    // API 훅을 한 번만 호출하여 모든 선택된 파일을 다운로드
    downloadFiles({ selectedFiles: downloadableSelectedFiles });
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

  /** @param {'desc' | 'asc'} nextOrder */
  // const changeSortOrder = (nextOrder) => {
  //   setSortOrder(nextOrder);
  // };
  //
  // const summary = useMemo(() => {
  //   const pureFiles = files.filter((item) => item.contentType !== folderContentType);
  //   const folders = files.filter((item) => item.contentType === folderContentType);
  //   const totalSize = pureFiles.reduce((acc, cur) => acc + (cur.size || 0), 0);
  //   const ownerCount = new Set(files.map((item) => item.uploadedBy)).size;
  //
  //   return {
  //     totalFiles: pureFiles.length,
  //     folderCount: folders.length,
  //     totalUsageText: formatFileSize(totalSize),
  //     ownerCount,
  //   };
  // }, [files]);

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
        // sortOrder={sortOrder}
        // onSortOrderChange={changeSortOrder}
      />

      {/*<FileSummaryCards*/}
      {/*  totalFiles={summary.totalFiles}*/}
      {/*  folderCount={summary.folderCount}*/}
      {/*  totalUsageText={summary.totalUsageText}*/}
      {/*  ownerCount={summary.ownerCount}*/}
      {/*/>*/}

      {/*<div className="rounded-2xl border border-gray-200 bg-white shadow-sm">*/}
      {/*  /!*<div className="border-b border-gray-200 px-6 py-5">*!/*/}
      {/*  /!*  <h3 className="text-2xl font-bold text-gray-900">파일 목록</h3>*!/*/}
      {/*  /!*</div>*!/*/}
      {/*  {selectedCount > 0 && (*/}
      {/*    <div className="border-b border-gray-100 px-6 py-4">*/}
      {/*      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">*/}
      {/*        <div className="text-sm font-medium text-blue-800">선택된 파일 {selectedCount}개</div>*/}

      {/*        <div className="flex items-center gap-2">*/}
      {/*          <button*/}
      {/*            type="button"*/}
      {/*            onClick={downloadSelectedFiles}*/}
      {/*            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"*/}
      {/*          >*/}
      {/*            <i className="ri-download-2-line text-base"></i>*/}
      {/*            선택 다운로드*/}
      {/*          </button>*/}

      {/*          <button*/}
      {/*            type="button"*/}
      {/*            onClick={clearSelection}*/}
      {/*            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"*/}
      {/*          >*/}
      {/*            선택 해제*/}
      {/*          </button>*/}

      {/*          <div className="ml-1 border-l border-blue-200 pl-3">*/}
      {/*            <button*/}
      {/*              type="button"*/}
      {/*              onClick={handleDeleteSelected}*/}
      {/*              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"*/}
      {/*            >*/}
      {/*              <i className="ri-delete-bin-line text-base"></i>*/}
      {/*              파일 삭제*/}
      {/*            </button>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  )}*/}

      <div className="min-h-[400px] rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          {sortedFiles.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <i className="ri-folder-open-line text-2xl text-gray-400"></i>
              </div>
              <div className="text-base text-gray-500">조건에 맞는 파일이 없습니다.</div>
            </div>
          ) : viewMode === fileViewMode.grid ? (
            // 🔥 진짜 파일 탐색기 UX 렌더링
            currentFolder === null ? (
              // 1. 최상위 뷰 (가상 폴더 목록 + 개별 파일)
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* 1-1. 작업별 폴더 (폴더가 있을 때만 렌더링) */}
                {Object.keys(taskFolders).length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
                      <i className="ri-folders-line text-blue-500"></i>
                      작업별 폴더
                    </h3>
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                      {Object.entries(taskFolders).map(([taskName, taskFiles]) => (
                        <FileFolderGridCard
                          key={taskName}
                          title={taskName}
                          itemCount={taskFiles.length}
                          onClick={() => setCurrentFolder(taskName)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-2. 개별 파일 (taskId가 없는 파일들) */}
                {standaloneFiles.length > 0 && (
                  <div>
                    <h3 className="mb-6 flex items-center gap-2 border-t border-gray-100 pt-8 text-lg font-bold text-gray-800">
                      <i className="ri-file-copy-2-line text-blue-500"></i>
                      공용 파일
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {standaloneFiles.map((item) => (
                        <FileGridCard key={item.uuid} item={item} onDownload={downloadFile} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 2. 폴더 내부 뷰 (해당 작업에 속한 파일들)
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {/* 빵판(Breadcrumb) 형태의 뒤로가기 헤더 */}
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setCurrentFolder(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    title="상위 폴더로 이동"
                  >
                    <i className="ri-arrow-left-line text-lg"></i>
                  </button>

                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className="cursor-pointer text-gray-500 transition hover:text-gray-900"
                      onClick={() => setCurrentFolder(null)}
                    >
                      전체 폴더
                    </span>
                    <i className="ri-arrow-right-s-line text-gray-400"></i>
                    <span className="text-gray-900">{currentFolder}</span>
                  </div>

                  <div className="ml-auto">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      총 {taskFolders[currentFolder]?.length || 0}개
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {taskFolders[currentFolder]?.map((item) => (
                    <FileGridCard key={item.uuid} item={item} onDownload={downloadFile} />
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
