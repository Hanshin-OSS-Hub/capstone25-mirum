/**
 * MIRUM 공통 로딩 스피너 컴포넌트
 * @param {object} props
 * @param {'sm' | 'md' | 'lg'} [props.size] - 스피너 크기
 * @param {string} [props.label] - 스피너 아래에 표시할 안내 문구
 * @param {string} [props.className] - 추가 스타일 클래스
 */
export default function LoadingSpinner({ size = 'md', label, className = '' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-blue-600 border-t-transparent shadow-sm`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {label && <p className="text-sm font-medium text-gray-500">{label}</p>}
    </div>
  );
}
