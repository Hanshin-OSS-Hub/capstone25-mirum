import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 마크다운 노트 편집/미리보기 컴포넌트
 * @param {Object} props
 * @param {string} props.notes - 마크다운 내용
 * @param {Function} props.onChange - 내용 변경 핸들러 (text) => void
 * @param {boolean} props.isReadOnly - 읽기 전용 여부
 * @param {Function} [props.onAiSummarize] - AI 정리 실행 핸들러
 * @param {boolean} [props.isAiLoading] - AI 정리 로딩 여부
 * @param {string} [props.aiError] - AI 정리 에러 메시지
 */
export default function TaskNote({
  notes,
  onChange,
  isReadOnly = false,
  onAiSummarize,
  isAiLoading = false,
  aiError = '',
}) {
  const [isPreview, setIsPreview] = useState(true);

  if (isReadOnly) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 min-h-[360px]">
          {notes ? (
              <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
              >
                {notes}
              </ReactMarkdown>
          ) : (
              <p className="text-gray-400 italic">메모가 없습니다.</p>
          )}
        </div>
    );
  }

  return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">메모</h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAiSummarize}
              disabled={!onAiSummarize || isAiLoading || !notes?.trim()}
              className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {isAiLoading ? 'AI 정리 중...' : 'AI 정리하기'}
            </button>

            <div className="inline-flex rounded-xl bg-gray-100 p-1">
            <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                    isPreview ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              미리보기
            </button>
            <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                    !isPreview ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              편집
            </button>
            </div>
          </div>
        </div>

        {aiError ? <p className="mb-3 text-sm text-red-500">{aiError}</p> : null}

        {isPreview ? (
            <div className="min-h-[320px] p-5 rounded-2xl border border-gray-200 bg-white prose prose-sm max-w-none">
              {notes ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {notes}
                  </ReactMarkdown>
              ) : (
                  <p className="text-gray-500 italic">메모가 없습니다. 편집 모드에서 작성해보세요.</p>
              )}
            </div>
        ) : (
            <div className="relative">
          <textarea
              value={notes}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-80 p-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-mono text-sm"
          />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                마크다운 지원
              </div>
            </div>
        )}
      </div>
  );
}

// 마크다운 스타일 커스터마이징
const markdownComponents = {
  h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-gray-900">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-gray-900">{children}</h3>,
  p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-3 text-gray-700">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 text-gray-700">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
  pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">{children}</pre>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">{children}</blockquote>,
};
