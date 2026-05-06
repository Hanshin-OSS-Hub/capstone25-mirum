import { FILE_CATEGORY, FOLDER_CONTENT_TYPE } from '@/constants/fileConstants.js';
import {
  IconFileExcel,
  IconFileGeneric,
  IconFileImage,
  IconFilePdf,
  IconFilePpt,
  IconFileText,
  IconFileVideo,
  IconFileZip,
  IconFolderFill,
} from '@/shared/assets/icons.js';
import { getFileExtension } from './fileFormatters';

export function getFileCategoryByContentType(contentType = '', filename = '') {
  if (contentType === FOLDER_CONTENT_TYPE) return FILE_CATEGORY.FOLDER;
  if (contentType.startsWith('image/') || contentType.startsWith('video/'))
    return FILE_CATEGORY.MEDIA;

  const ext = getFileExtension(filename);
  const mediaExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp4', 'mov', 'avi'];
  if (mediaExtensions.includes(ext)) return FILE_CATEGORY.MEDIA;

  return FILE_CATEGORY.DOCUMENT;
}

export function getFileTypeLabel(filename = '', contentType = '') {
  if (contentType === FOLDER_CONTENT_TYPE) return '폴더';
  const ext = getFileExtension(filename);
  if (ext) return ext.toUpperCase();
  if (contentType.startsWith('image/')) return 'IMAGE';
  if (contentType.startsWith('video/')) return 'VIDEO';
  return 'FILE';
}

/**
 * 파일 타입에 맞는 Icon 컴포넌트를 반환합니다.
 * @param filename
 * @param contentType
 */
export function getFileIconComponent(filename = '', contentType = '') {
  if (contentType === FOLDER_CONTENT_TYPE) return IconFolderFill;

  const ext = getFileExtension(filename);
  if (contentType.startsWith('image/')) return IconFileImage;
  if (contentType.startsWith('video/')) return IconFileVideo;
  if (ext === 'pdf') return IconFilePdf;
  if (ext === 'ppt' || ext === 'pptx') return IconFilePpt;
  if (ext === 'doc' || ext === 'docx' || ext === 'hwp') return IconFileText;
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return IconFileExcel;
  if (ext === 'zip' || ext === 'rar') return IconFileZip;

  return IconFileGeneric;
}

export function getIconTextColor(filename = '', contentType = '') {
  if (contentType === FOLDER_CONTENT_TYPE) return 'text-blue-500';
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
    case FILE_CATEGORY.FOLDER:
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case FILE_CATEGORY.MEDIA:
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case FILE_CATEGORY.DOCUMENT:
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100';
  }
}

export function getCategoryLabel(category) {
  switch (category) {
    case FILE_CATEGORY.FOLDER:
      return '폴더';
    case FILE_CATEGORY.MEDIA:
      return '미디어';
    case FILE_CATEGORY.DOCUMENT:
      return '문서';
    default:
      return '전체';
  }
}

export function getOwnerInitial(owner = '') {
  return owner?.slice(0, 1).toUpperCase() || '?';
}

export function getIconType(item) {
  const name = item.originalFilename?.toLowerCase() || '';
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'ppt';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'excel';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.hwp')) return 'doc';
  if (item.contentType?.startsWith('image/')) return 'image';
  if (item.contentType?.startsWith('video/')) return 'video';
  if (name.endsWith('.zip') || name.endsWith('.rar')) return 'zip';
  return 'file';
}

export function getTypeIconStyle(filename = '', contentType = '') {
  const ext = getFileExtension(filename);

  if (contentType.startsWith('image/')) {
    return {
      Icon: IconFileImage,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      subLabel: ext ? ext.toUpperCase() : 'IMAGE',
    };
  }

  if (contentType.startsWith('video/')) {
    return {
      Icon: IconFileVideo,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-50',
      subLabel: ext ? ext.toUpperCase() : 'VIDEO',
    };
  }

  if (ext === 'pdf') {
    return {
      Icon: IconFilePdf,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      subLabel: 'PDF',
    };
  }

  if (ext === 'ppt' || ext === 'pptx') {
    return {
      Icon: IconFilePpt,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      subLabel: ext?.toUpperCase(),
    };
  }

  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
    return {
      Icon: IconFileExcel,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      subLabel: ext?.toUpperCase(),
    };
  }

  if (ext === 'doc' || ext === 'docx' || ext === 'hwp') {
    return {
      Icon: IconFileText,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      subLabel: ext?.toUpperCase(),
    };
  }

  if (ext === 'zip' || ext === 'rar') {
    return {
      Icon: IconFileZip,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subLabel: ext?.toUpperCase(),
    };
  }

  return {
    Icon: IconFileGeneric,
    iconColor: 'text-gray-500',
    bgColor: 'bg-gray-100',
    subLabel: ext ? ext.toUpperCase() : 'FILE',
  };
}

/**
 * 리스트 뷰에서 사용하는 파일 타입 아이콘 표시 클래스(배경/텍스트)를 반환합니다.
 * 그리드뷰와 동일한 색상 규칙을 공유합니다.
 * @param filename
 * @param contentType
 * @param isExpired
 */
export function getListTypeIconClasses(filename = '', contentType = '', isExpired = false) {
  if (isExpired) {
    return {
      wrapperClass: 'rounded-xl bg-gray-100',
      iconClass: 'text-gray-400',
    };
  }

  const iconStyle = getTypeIconStyle(filename, contentType);
  return {
    wrapperClass: `rounded-xl ${iconStyle.bgColor}`,
    iconClass: iconStyle.iconColor,
  };
}
