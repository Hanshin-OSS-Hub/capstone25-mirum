import { fileCategory, folderContentType } from '@/types/file';
import { getFileExtension } from './fileFormatters';

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

  if (contentType.startsWith('image/') || contentType.startsWith('video/'))
    return 'text-emerald-500';
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

export function getIconType(item) {
  const name = item.originalFilename?.toLowerCase() || '';

  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'ppt';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'excel';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.hwp')) return 'doc';
  if (item.contentType?.startsWith('image/')) return 'image';
  if (item.contentType?.startsWith('video/')) return 'video';

  return 'file';
}

export function getTypeIconStyle(filename = '', contentType = '') {
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
      subLabel: ext?.toUpperCase(),
    };
  }

  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
    return {
      icon: 'ri-file-excel-2-line',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      subLabel: ext?.toUpperCase(),
    };
  }

  if (ext === 'doc' || ext === 'docx' || ext === 'hwp') {
    return {
      icon: 'ri-file-text-line',
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      subLabel: ext?.toUpperCase(),
    };
  }

  if (ext === 'zip' || ext === 'rar') {
    return {
      icon: 'ri-file-zip-line',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subLabel: ext?.toUpperCase(),
    };
  }

  return {
    icon: 'ri-file-line',
    iconColor: 'text-gray-500',
    bgColor: 'bg-gray-100',
    subLabel: ext ? ext.toUpperCase() : 'FILE',
  };
}
