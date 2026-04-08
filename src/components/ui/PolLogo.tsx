import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PolLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** If true, shows just the square icon crop. If false, shows full logo. */
  square?: boolean;
}

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

/**
 * The real People Of Lisbon logo asset.
 * Red square with white "People Of Lisbon" text.
 * Do NOT use text-based approximations — always use this component.
 */
export default function PolLogo({ size = 'md', className, square = true }: PolLogoProps) {
  const px = SIZE_MAP[size];
  const radius = px <= 32 ? 7 : px <= 44 ? 10 : px <= 64 ? 14 : 20;

  return (
    <div
      className={cn('flex-shrink-0 overflow-hidden', className)}
      style={{ width: px, height: px, borderRadius: radius }}
    >
      <Image
        src="/pol-logo.png"
        alt="People Of Lisbon"
        width={px}
        height={px}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
}
