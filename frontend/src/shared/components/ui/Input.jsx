import { cn } from '@/shared/lib/cn.js';

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-input bg-background px-4 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-ring/20',
        className,
      )}
      {...props}
    />
  );
}
