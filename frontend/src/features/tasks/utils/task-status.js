export const getStatusText = (status) => {
  switch (status) {
    case 'DONE':
      return '완료';
    case 'IN_PROGRESS':
      return '진행중';
    default:
      return '대기';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'DONE':
      return 'ri-check-line text-green-600';
    case 'IN_PROGRESS':
      return 'ri-time-line text-orange-600';
    default:
      return 'ri-circle-line text-gray-400';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'DONE':
      return 'bg-green-100 text-green-800';
    case 'IN_PROGRESS':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusDotColor = (status) => {
  switch (status) {
    case 'DONE':
      return 'bg-green-500';
    case 'IN_PROGRESS':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};
