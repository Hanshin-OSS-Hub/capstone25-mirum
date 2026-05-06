import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IconEdit, IconSearch, IconSparkles, IconWarning } from '@/shared/assets/icons.js';

/**
 * 마크다운 노트 편집/미리보기 컴포넌트
 * @param {object} props
 * @param {string} props.notes - 마크다운 내용
 * @param {Function} props.onChange - 내용 변경 핸들러 (text) => void
 * @param {boolean} props.isReadOnly - 읽기 전용 여부
 * @param {Function} [props.onAiSummarize] - AI 정리 실행 핸들러
 * @param {boolean} [props.isAiLoading] - AI 정리 로딩 여부
 * @param {string} [props.aiError] - AI 정리 에러 메시지
 * @param props.headerContent
 */
export default function TaskNote({
  notes,
  onChange,
  isReadOnly = false,
  onAiSummarize,
  isAiLoading = false,
  aiError = '',
  headerContent,
}) {
  const [isPreview, setIsPreview] = useState(true);

  if (isReadOnly) {
    return (
      <div className="min-h-[300px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {notes ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
          </div>
        ) : (
          <p className="italic text-gray-400">작성된 메모가 없습니다.</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
        {headerContent || <h3 className="text-lg font-bold text-gray-900">작업 상세 메모</h3>}

        <div className="flex flex-wrap items-center gap-3">
          {onAiSummarize && (
            <button
              type="button"
              onClick={onAiSummarize}
              disabled={isAiLoading || !notes?.trim()}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconSparkles size={16} className={isAiLoading ? 'animate-pulse' : ''} />
              <span>{isAiLoading ? 'AI 분석 중...' : 'AI로 요약하기'}</span>
            </button>
          )}

          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-all ${
                isPreview ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <IconSearch size={14} />
              미리보기
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-all ${
                !isPreview
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <IconEdit size={14} />
              편집
            </button>
          </div>
        </div>
      </div>

      {aiError && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-red-600">
            <IconWarning size={16} /> {aiError}
          </p>
        </div>
      )}

      <div className="relative">
        {isPreview ? (
          <div className="prose prose-sm min-h-[320px] max-w-none rounded-xl border border-gray-50 bg-gray-50/30 p-6">
            {notes ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
            ) : (
              <div className="flex items-center justify-center py-20 text-center">
                <p className="text-sm text-gray-400">메모가 없습니다.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <textarea
              value={notes}
              onChange={(e) => onChange(e.target.value)}
              className="h-80 w-full resize-none rounded-xl border border-gray-200 bg-white p-6 font-medium text-gray-800 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="여기에 마크다운 형식으로 메모를 작성하세요..."
            />
            <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-300">
              Markdown Supported
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
