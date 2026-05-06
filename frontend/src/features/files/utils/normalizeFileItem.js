import { formatDisplayDate, formatFileSize } from './fileFormatters';
import { getFileCategoryByContentType, getFileTypeLabel } from './filePresentation';

export function normalizeFileItem(item) {
  const category = getFileCategoryByContentType(item.contentType, item.originalFilename);

  return {
    uuid: item.uuid,
    projectId: item.projectId,
    taskId: item.taskId,
    originalFilename: item.originalFilename,
    size: item.size ?? 0,
    contentType: item.contentType || '',
    uploadedDate: item.uploadedDate || item.createdDate || '',
    uploadedBy: item.uploadedBy || '알 수 없음',
    previewUrl: item.previewUrl || '',
    expiredDate: item.expiredDate || null,
    itemCount: item.itemCount || null,
    category,
    extensionLabel: getFileTypeLabel(item.originalFilename, item.contentType),
    displaySize: formatFileSize(item.size, item.contentType),
    displayDate: formatDisplayDate(item.uploadedDate || item.createdDate),
  };
}
