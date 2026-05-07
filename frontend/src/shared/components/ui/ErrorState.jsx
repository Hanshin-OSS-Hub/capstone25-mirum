import Button from './Button.jsx';

export default function ErrorState({
  title = '데이터를 불러오지 못했습니다.',
  message = '잠시 후 다시 시도해 주세요.',
  retryLabel = '다시 시도',
  onRetry,
  className = '',
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center shadow-sm ${className}`}
    >
      <div className="mx-auto mb-4 text-[56px] font-black leading-none text-destructive/15">!</div>
      <h3 className="text-2xl font-black tracking-tight text-card-foreground">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
        {message}
      </p>
      {onRetry ? (
        <Button variant="destructive" className="mt-8" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </section>
  );
}
