'use client';

import { useState } from 'react';
import { getInitials, cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name || '?');
  const sizeClass = SIZE_MAP[size];
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <div className={cn('rounded-full overflow-hidden flex-shrink-0 bg-stone-100', sizeClass, className)}>
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn('rounded-full flex-shrink-0 flex items-center justify-center font-bold bg-brand text-white', sizeClass, className)}>
      {initials}
    </div>
  );
}
