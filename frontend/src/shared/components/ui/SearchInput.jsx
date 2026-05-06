import { cn } from '@/shared/lib/cn.js';
import Input from './Input.jsx';

export default function SearchInput({
  icon: Icon,
  wrapperClassName = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      {Icon ? (
        <Icon
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      ) : null}
      <Input className={cn(Icon ? 'pl-11 pr-4' : '', inputClassName)} {...props} />
    </div>
  );
}
