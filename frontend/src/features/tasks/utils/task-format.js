export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateDot = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}. ${m}. ${day}.`;
};

export const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const isTaskOverdue = (dueDate, status) => {
  if (!dueDate) return false;
  const today = new Date();
  const d = new Date(dueDate);
  return d < today && status !== 'DONE';
};
