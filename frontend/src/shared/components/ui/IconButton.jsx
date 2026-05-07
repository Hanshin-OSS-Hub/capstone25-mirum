import { cn } from '@/shared/lib/cn.js';
import Button from './Button.jsx';

export default function IconButton({ className = '', size = 'icon', variant = 'icon', ...props }) {
  return (
    <Button size={size} variant={variant} className={cn('rounded-xl', className)} {...props} />
  );
}
