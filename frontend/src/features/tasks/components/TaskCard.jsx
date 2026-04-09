// import { taskStatus } from '@/features/tasks/types/task.js';

export default function TaskCard({ task, onClick }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'DONE':
        return 'ri-check-line text-green-600';
      case 'IN_PROGRESS':
        return 'ri-time-line text-orange-600';
      default:
        return 'ri-circle-line text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DONE':
        return '완료';
      case 'IN_PROGRESS':
        return '진행중';
      default:
        return '대기';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== 'DONE';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className="flex min-h-[180px] cursor-pointer flex-col rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
    >
      {/* Task Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="-ml-1 flex items-center space-x-2">
          <i className={`${getStatusIcon(task.status)} -ml-1 text-lg`}></i>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
          >
            {getStatusText(task.status)}
          </span>
        </div>

        {task.dueDate && (
          <span className={`text-xs ${isOverdue() ? 'font-medium text-red-600' : 'text-gray-500'}`}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* 내용 영역 (짧아져도 푸터는 아래로 고정) */}
      <div className="flex-1">
        {/* Task Title */}
        <h4 className="mb-2 line-clamp-2 font-medium text-gray-900">{task.title}</h4>

        {/* Task Description */}
        {task.description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Task Footer (항상 카드 맨 아래) */}
      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-gray-500">
        <span>업데이트: {formatDate(task.updatedDate)}</span>
        <div className="flex items-center space-x-1">
          <i className="ri-more-line text-gray-400"></i>
        </div>
      </div>
    </div>
  );
}
