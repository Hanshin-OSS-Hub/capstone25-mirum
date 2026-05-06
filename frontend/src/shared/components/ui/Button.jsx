import { cn } from '@/shared/lib/cn.js';

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-bold whitespace-nowrap transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50';
const buttonVariants = {
  default:
    'bg-primary text-primary-foreground shadow-lg shadow-blue-100 hover:bg-primary/90 focus:ring-4 focus:ring-ring/20',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-4 focus:ring-ring/20',
  outline:
    'border border-border bg-background text-foreground shadow-sm hover:bg-muted focus:ring-4 focus:ring-ring/20',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-4 focus:ring-ring/20',
  destructive:
    'bg-destructive text-destructive-foreground shadow-lg shadow-red-100 hover:bg-destructive/90 focus:ring-4 focus:ring-ring/20',
  icon: 'border border-border bg-background text-muted-foreground shadow-sm hover:bg-muted',
};
const buttonSizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
  icon: 'h-11 w-11 p-0',
};

export default function Button({
  variant = 'default',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(baseClass, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}
