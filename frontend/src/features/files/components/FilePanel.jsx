import { useEffect, useMemo, useState } from 'react';
import { useGetFiles } from '@/features/files/api/useGetFiles.js';
import FileGridCard from '@/features/files/components/FileGridCard.jsx';
import FileListTable from '@/features/files/components/FileListTable.jsx';
import FileSummaryCards from '@/features/files/components/FileSummaryCards.jsx';
import FileToolbar from '@/features/files/components/FileToolbar.jsx';
import {
  fileCategory,
  fileViewMode,
  folderContentType,
  formatFileSize,
} from '@/features/files/types/file.js';

/** @param {{ projectId: any }} props */
export default function FilePanel({ projectId }) {
  const { data: files = [], isLoading } = useGetFiles(projectId);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState(fileCategory.all);
  const [viewMode, setViewMode] = useState(fileViewMode.list);
  const [selectedFileIds, setSelectedFileIds] = useState(/** @type {string[]} */ ([]));
  const [sortKey, setSortKey] = useState(/** @type {'createdDate' | 'size'} */ ('createdDate'));
  const [sortOrder, setSortOrder] = useState(/** @type {'desc' | 'asc'} */ ('desc'));

  useEffect(() => {
    setSelectedFileIds([]);
  }, [projectId]);

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
      const timeValue = new Date(item.createdDate || 0).getTime();
      return Number.isNaN(timeValue) ? 0 : timeValue;
    };

    /** @param {any} item */
    const getSizeValue = (item) => {
      if (item.contentType === folderContentType) return -1;
      return item.size || 0;
    };

    return [...filteredFiles].sort((left, right) => {
      const diff =
        sortKey === 'size'
          ? getSizeValue(left) - getSizeValue(right)
          : getTimeValue(left) - getTimeValue(right);

      return sortOrder === 'desc' ? -diff : diff;
    });
  }, [filteredFiles, sortKey, sortOrder]);

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

    const href = item.downloadUrl || item.previewUrl;
    const fallbackText = `파일명: ${item.originalFilename}\n크기: ${item.displaySize}\n업로드한 사람: ${item.createdBy}`;
    const downloadHref = href || `data:text/plain;charset=utf-8,${encodeURIComponent(fallbackText)}`;

    const link = document.createElement('a');
    link.href = downloadHref;
    link.download = item.originalFilename || 'download';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
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
    const visibleIds = sortedFiles.map((item) => item.uuid);
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
    downloadableSelectedFiles.forEach(downloadFile);
  };

  const handleDeleteSelected = () => {
    if (selectedFileIds.length === 0) return;

    const shouldDelete = window.confirm('선택한 파일을 삭제하시겠습니까?');
    if (!shouldDelete) return;

    // TODO: 백엔드 삭제 API 연동 전 임시 처리
    console.log('삭제 대상 파일 ID', selectedFileIds);
    setSelectedFileIds([]);
  };

  const toggleDateSort = () => {
    if (sortKey === 'createdDate') {
      setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc'));
      return;
    }

    setSortKey('createdDate');
    setSortOrder('desc');
  };

  const toggleSizeSort = () => {
    if (sortKey === 'size') {
      setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc'));
      return;
    }

    setSortKey('size');
    setSortOrder('desc');
  };

  /** @param {'desc' | 'asc'} nextOrder */
  const changeSortOrder = (nextOrder) => {
    setSortOrder(nextOrder);
  };

  const summary = useMemo(() => {
    const pureFiles = files.filter((item) => item.contentType !== folderContentType);
    const folders = files.filter((item) => item.contentType === folderContentType);
    const totalSize = pureFiles.reduce((acc, cur) => acc + (cur.size || 0), 0);
    const ownerCount = new Set(files.map((item) => item.createdBy)).size;

    return {
      totalFiles: pureFiles.length,
      folderCount: folders.length,
      totalUsageText: formatFileSize(totalSize),
      ownerCount,
    };
  }, [files]);

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
        sortOrder={sortOrder}
        onSortOrderChange={changeSortOrder}
      />

      <FileSummaryCards
        totalFiles={summary.totalFiles}
        folderCount={summary.folderCount}
        totalUsageText={summary.totalUsageText}
        ownerCount={summary.ownerCount}
      />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="text-2xl font-bold text-gray-900">파일 목록 ({sortedFiles.length}개)</h3>
        </div>

        {selectedCount > 0 && (
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium text-blue-800">
                선택된 파일 {selectedCount}개
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadSelectedFiles}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <i className="ri-download-2-line text-base"></i>
                  선택 다운로드
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                >
                  선택 해제
                </button>

                <div className="ml-1 border-l border-blue-200 pl-3">
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    <i className="ri-delete-bin-line text-base"></i>
                    파일 삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {isLoading ? (
            <div className="flex h-72 items-center justify-center text-gray-400">
              파일을 불러오는 중입니다...
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <i className="ri-folder-open-line text-2xl text-gray-400"></i>
              </div>
              <div className="text-base text-gray-500">조건에 맞는 파일이 없습니다.</div>
            </div>
          ) : viewMode === fileViewMode.grid ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {sortedFiles.map((item) => (
                <FileGridCard key={item.uuid} item={item} onDownload={downloadFile} />
              ))}
            </div>
          ) : (
            <FileListTable
              items={sortedFiles}
              selectedFileIds={selectedFileIds}
              onToggleItemSelect={toggleFileSelection}
              onToggleAllSelect={toggleVisibleSelection}
              onDownloadItem={downloadFile}
              sortKey={sortKey}
              sortOrder={sortOrder}
              onToggleSizeSort={toggleSizeSort}
              onToggleDateSort={toggleDateSort}
            />
          )}
        </div>
      </div>
    </div>
  );
}
