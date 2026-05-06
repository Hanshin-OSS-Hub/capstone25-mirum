import { useNavigate } from 'react-router-dom';

/**
 * 공통 404 상태 섹션
 * @param {{
 *  message?: string,
 *  homeLabel?: string,
 *  retryLabel?: string,
 * }} props
 */
export default function NotFoundState({
  message = '요청하신 페이지를 찾을 수 없습니다.',
  homeLabel = '홈으로 이동',
  retryLabel = '다시 시도하기',
}) {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-12%] h-[420px] w-[420px] rounded-full bg-blue-100/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[460px] w-[460px] rounded-full bg-indigo-100/40 blur-[110px]" />
      </div>

      <section className="relative flex min-h-[420px] w-full max-w-3xl flex-col justify-center rounded-[40px] border border-gray-200 bg-white px-8 py-14 text-center shadow-xl sm:px-14">
        <div className="mb-6 text-[88px] font-black leading-none tracking-[-0.05em] text-gray-100 sm:text-[132px]">
          404
        </div>
        <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-gray-500 sm:text-base">
          {message}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
          >
            {homeLabel}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
          >
            {retryLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
