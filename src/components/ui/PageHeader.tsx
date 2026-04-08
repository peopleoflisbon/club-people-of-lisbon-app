import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between px-4 lg:px-8 py-6', className)}>
      <div>
        <h1 className="font-display text-3xl lg:text-4xl text-ink leading-none">{title}</h1>
        {subtitle && (
          <p className="text-stone-500 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
