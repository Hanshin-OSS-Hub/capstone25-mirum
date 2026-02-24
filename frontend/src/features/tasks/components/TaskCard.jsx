export default function TaskCard({ task, onClick }) {

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'ri-check-line text-green-600';
      case 'in-progress': return 'ri-time-line text-orange-600';
      default: return 'ri-circle-line text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in-progress': return '진행중';
      default: return '대기';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== 'completed';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
      <div
          onClick={onClick}
          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
      >
        {/* Task Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <i className={`${getStatusIcon(task.status)} text-lg`}></i>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
            {getStatusText(task.status)}
          </span>
          </div>
          {task.dueDate && (
              <span className={`text-xs ${isOverdue() ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {formatDate(task.dueDate)}
          </span>
          )}
        </div>

        {/* Task Title */}
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h4>

        {/* Task Description */}
        {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 2).map((tag, index) => (
                  <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                  >
              {tag}
            </span>
              ))}
              {task.tags.length > 2 && (
                  <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
              )}
            </div>
        )}

        {/* Task Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>업데이트: {formatDate(task.updatedAt)}</span>
          <div className="flex items-center space-x-1">
            <i className="ri-more-line text-gray-400"></i>
          </div>
        </div>
      </div>
  );
}