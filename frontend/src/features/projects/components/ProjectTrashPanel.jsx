import { useMemo, useState } from 'react';

/**
 * @typedef {Object} DeletedTaskItem
 * @property {string | number} [id]
 * @property {string} [title]
 * @property {string} [assignee]
 * @property {string} [deletedAt]
 */

/**
 * @typedef {Object} DeletedFileItem
 * @property {string | number} [id]
 * @property {string} [filename]
 * @property {string} [owner]
 * @property {string} [deletedAt]
 */

/**
 * @param {{
 *  deletedTasks?: DeletedTaskItem[];
 *  deletedFiles?: DeletedFileItem[];
 * }} props
 */
export default function ProjectTrashPanel({ deletedTasks = [], deletedFiles = [] }) {
  const [activeTab, setActiveTab] = useState('tasks');

  const taskItems = useMemo(() => deletedTasks, [deletedTasks]);
  const fileItems = useMemo(() => deletedFiles, [deletedFiles]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">TRASH</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">휴지통</h2>
        <p className="mt-2 text-sm text-gray-600">
          삭제된 작업 카드와 파일을 확인할 수 있습니다.
        </p>

        <div className="mt-5 inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'tasks'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            카드 휴지통
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'files'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            파일 휴지통
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">카드 휴지통</h3>
          </div>

          {taskItems.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              삭제된 카드가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {taskItems.map((task, index) => (
                <div key={task.id ?? index} className="px-6 py-4">
                  <p className="text-base font-semibold text-gray-900">{task.title || '제목 없음'}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    담당자: {task.assignee || '미지정'} · 삭제일: {task.deletedAt || '-'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">파일 휴지통</h3>
          </div>

          {fileItems.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              삭제된 파일이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {fileItems.map((file, index) => (
                <div key={file.id ?? index} className="px-6 py-4">
                  <p className="text-base font-semibold text-gray-900">{file.filename || '파일명 없음'}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    삭제자: {file.owner || '알 수 없음'} · 삭제일: {file.deletedAt || '-'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
