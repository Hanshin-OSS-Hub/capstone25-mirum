import { cn } from '@/shared/lib/cn.js';

const baseClass =
  'inline-flex items-center justify-center rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider';
const badgeVariants = {
  default: 'border-border bg-muted text-muted-foreground',
  leader: 'border-warning/25 bg-warning/10 text-warning',
  me: 'border-primary/20 bg-primary/10 text-primary',
  waiting: 'border-border bg-muted text-muted-foreground',
  outline: 'border-border bg-background text-foreground',
};

export default function Badge({ className = '', variant = 'default', ...props }) {
  return <span className={cn(baseClass, badgeVariants[variant], className)} {...props} />;
}
