import Button from './Button.jsx';

export default function EmptyState({
  title = '데이터가 없습니다.',
  description = '',
  actionLabel = '',
  onAction,
  className = '',
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center shadow-sm ${className}`}
    >
      <h3 className="text-2xl font-black tracking-tight text-card-foreground">{title}</h3>
      {description ? (
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-8" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
