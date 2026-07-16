import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ className, children, hover = false, padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-100 shadow-sm rounded-2xl transition-all duration-200',
        hover && 'hover:shadow-md hover:-translate-y-0.5',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
