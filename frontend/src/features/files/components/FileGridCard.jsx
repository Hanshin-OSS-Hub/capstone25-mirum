import {
  fileCategory,
  getCategoryBadgeClass,
  getCategoryLabel,
  getFileIconClass,
  getIconTextColor,
  getOwnerInitial,
} from '@/features/files/types/file.js';

export default function FileGridCard({ item, onDownload }) {
  const isFolder = item.category === fileCategory.folder;
  const isMedia = item.category === fileCategory.media && !!item.previewUrl;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
          {isMedia ? (
            <img
              src={item.previewUrl}
              alt={item.originalFilename}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <i
              className={`${getFileIconClass(
                item.originalFilename,
                item.contentType
              )} text-4xl ${getIconTextColor(item.originalFilename, item.contentType)}`}
            ></i>
          )}
        </div>

        <span
          className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getCategoryBadgeClass(
            item.category
          )}`}
        >
          {getCategoryLabel(item.category)}
        </span>
      </div>

      <div className="mt-4">
        <div className="line-clamp-1 text-lg font-semibold text-gray-900">
          {item.originalFilename}
        </div>

        <div className="mt-1 text-sm text-gray-500">
          {isFolder ? `항목 ${item.itemCount ?? 0}개` : `${item.extensionLabel} · ${item.displaySize}`}
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-xs font-semibold text-white">
              {getOwnerInitial(item.createdBy)}
            </div>
            <span className="truncate text-sm text-gray-600">{item.createdBy}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-gray-500">{item.displayDate}</span>

            <button
              type="button"
              onClick={() => onDownload?.(item)}
              disabled={isFolder}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                isFolder
                  ? 'border-gray-200 bg-gray-50 text-gray-300'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              }`}
              title={isFolder ? '폴더는 다운로드할 수 없습니다' : '다운로드'}
            >
              <i className="ri-download-2-line text-base"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
