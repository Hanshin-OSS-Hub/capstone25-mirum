export const fileCategory = {
  all: 'all',
  folder: 'folder',
  media: 'media',
  document: 'document',
};

export const fileViewMode = {
  list: 'list',
  grid: 'grid',
};

export const folderContentType = 'application/x-folder';

export function getFileExtension(filename = '') {
  const parts = filename.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1].toLowerCase();
}

export function getFileCategoryByContentType(contentType = '', filename = '') {
  if (contentType === folderContentType) return fileCategory.folder;

  if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
    return fileCategory.media;
  }

  const ext = getFileExtension(filename);
  const mediaExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp4', 'mov', 'avi'];
  if (mediaExtensions.includes(ext)) return fileCategory.media;

  return fileCategory.document;
}

export function formatFileSize(size = 0, contentType = '') {
  if (contentType === folderContentType) return '-';
  if (!size || size <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  if (unitIndex === 0) {
    return `${Math.round(value)} ${units[unitIndex]}`;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDisplayDate(dateString = '') {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getFileTypeLabel(filename = '', contentType = '') {
  if (contentType === folderContentType) return '폴더';

  const ext = getFileExtension(filename);
  if (ext) return ext.toUpperCase();

  if (contentType.startsWith('image/')) return 'IMAGE';
  if (contentType.startsWith('video/')) return 'VIDEO';

  return 'FILE';
}

export function getFileIconClass(filename = '', contentType = '') {
  if (contentType === folderContentType) return 'ri-folder-2-fill';

  const ext = getFileExtension(filename);

  if (contentType.startsWith('image/')) return 'ri-image-2-line';
  if (contentType.startsWith('video/')) return 'ri-video-line';

  if (ext === 'pdf') return 'ri-file-pdf-line';
  if (ext === 'ppt' || ext === 'pptx') return 'ri-file-ppt-2-line';
  if (ext === 'doc' || ext === 'docx' || ext === 'hwp') return 'ri-file-text-line';
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'ri-file-excel-2-line';
  if (ext === 'zip' || ext === 'rar') return 'ri-file-zip-line';

  return 'ri-file-line';
}

export function getIconTextColor(filename = '', contentType = '') {
  if (contentType === folderContentType) return 'text-blue-500';

  const ext = getFileExtension(filename);

  if (contentType.startsWith('image/') || contentType.startsWith('video/')) return 'text-emerald-500';
  if (ext === 'pdf') return 'text-red-500';
  if (ext === 'ppt' || ext === 'pptx') return 'text-orange-500';
  if (ext === 'doc' || ext === 'docx' || ext === 'hwp') return 'text-indigo-500';
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'text-green-500';

  return 'text-gray-500';
}

export function getCategoryBadgeClass(category) {
  switch (category) {
    case fileCategory.folder:
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case fileCategory.media:
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case fileCategory.document:
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100';
  }
}

export function getCategoryLabel(category) {
  switch (category) {
    case fileCategory.folder:
      return '폴더';
    case fileCategory.media:
      return '미디어';
    case fileCategory.document:
      return '문서';
    default:
      return '전체';
  }
}

export function getOwnerInitial(owner = '') {
  return owner?.slice(0, 1) || '?';
}

export function normalizeFileItem(item) {
  const category = getFileCategoryByContentType(item.contentType, item.originalFilename);

  return {
    uuid: item.uuid,
    originalFilename: item.originalFilename,
    size: item.size ?? 0,
    contentType: item.contentType || '',
    createdDate: item.createdDate || '',
    createdBy: item.createdBy || '알 수 없음',
    itemCount: item.itemCount ?? null,
    previewUrl: item.previewUrl || '',
    category,
    extensionLabel: getFileTypeLabel(item.originalFilename, item.contentType),
    displaySize: formatFileSize(item.size, item.contentType),
    displayDate: formatDisplayDate(item.createdDate),
  };
}
