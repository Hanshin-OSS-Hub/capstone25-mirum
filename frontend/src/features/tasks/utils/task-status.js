import { IconCalendar, IconCheck, IconFileList, IconRefresh } from '@/shared/assets/icons.js';

/**
 * 상태별 아이콘 클래스명을 반환합니다.
 * @param status
 * @deprecated 컴포넌트 방식을 권장합니다. getStatusIconComponent를 사용하세요.
 */
export function getStatusIcon(status) {
  switch (status) {
    case 'DONE':
      return 'ri-checkbox-circle-line';
    case 'IN_PROGRESS':
      return 'ri-refresh-line';
    default:
      return 'ri-time-line';
  }
}

/**
 * 상태별 Remix Icon 컴포넌트를 반환합니다.
 * @param status
 */
export function getStatusIconComponent(status) {
  switch (status) {
    case 'DONE':
      return IconCheck;
    case 'IN_PROGRESS':
      return IconRefresh;
    default:
      return IconCalendar;
  }
}

export function getStatusColor(status) {
  switch (status) {
    case 'DONE':
      return 'bg-gray-800 text-white';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getStatusDotColor(status) {
  switch (status) {
    case 'DONE':
      return 'bg-gray-800';
    case 'IN_PROGRESS':
      return 'bg-blue-500';
    default:
      return 'bg-gray-400';
  }
}

export function getStatusText(status) {
  switch (status) {
    case 'DONE':
      return 'Done';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'TODO':
      return 'Todo';
    default:
      return status;
  }
}
