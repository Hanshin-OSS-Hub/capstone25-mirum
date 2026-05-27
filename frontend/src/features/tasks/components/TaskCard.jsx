import { formatDate, isTaskOverdue } from '@/features/tasks/utils/task-format.js';
import {
  getStatusColor,
  getStatusIconComponent,
  getStatusText,
} from '@/features/tasks/utils/task-status.js';
import { IconMore } from '@/shared/assets/icons.js';

/**
 * 태스크 카드 컴포넌트
 * @typedef {import('@/types/task.js').TaskData} TaskData
 * @param {object} props
 * @param {TaskData} props.task - 표시할 태스크 데이터
 * @param {() => void} props.onClick - 카드 클릭 시 호출되는 콜백
 */
export default function TaskCard({ task, onClick }) {
  const StatusIcon = getStatusIconComponent(task.status);

  return (
    <div
      onClick={onClick}
      className="flex min-h-[180px] cursor-pointer flex-col rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
    >
      {/* Task Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon size={18} className="text-gray-500" />
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
          >
            {getStatusText(task.status)}
          </span>
        </div>

        {task.dueDate && (
          <span
            className={`text-xs ${isTaskOverdue(task.dueDate, task.status) ? 'font-medium text-red-600' : 'text-gray-500'}`}
          >
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <h4 className="mb-2 line-clamp-2 font-medium text-gray-900">{task.title}</h4>

        {task.description && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Task Footer */}
      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-gray-500">
        <span>업데이트: {formatDate(task.updatedDate)}</span>
        <div className="flex items-center">
          <IconMore size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
