import { cn } from '@/shared/lib/cn.js';

export function Dialog({ open, children }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {children}
    </div>
  );
}

export function DialogOverlay({ onClick, className = '' }) {
  return (
    <div
      className={cn('absolute inset-0 bg-black/60 backdrop-blur-sm', className)}
      onClick={onClick}
      role="presentation"
    />
  );
}

export function DialogContent({ className = '', children, ...props }) {
  return (
    <div
      {...props}
      className={cn(
        'animate-in zoom-in-95 relative w-full overflow-hidden rounded-[40px] bg-card shadow-2xl ring-1 ring-black/5 duration-200',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', children }) {
  return <div className={cn('border-b border-border px-8 py-6', className)}>{children}</div>;
}

export function DialogTitle({ className = '', children }) {
  return <h2 className={cn('text-2xl font-black text-card-foreground', className)}>{children}</h2>;
}

export function DialogDescription({ className = '', children }) {
  return (
    <p className={cn('mt-1 text-sm font-medium text-muted-foreground', className)}>{children}</p>
  );
}

export function DialogBody({ className = '', children }) {
  return <div className={cn('p-8', className)}>{children}</div>;
}

export function DialogFooter({ className = '', children }) {
  return <div className={cn('border-t border-border bg-muted/40 p-8', className)}>{children}</div>;
}
