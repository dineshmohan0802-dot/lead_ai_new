import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'gray' | 'green' | 'yellow' | 'red';
  className?: string;
}

// ─── Intent Badges ───────────────────────────────────────────────────
const intentMap: Record<string, string> = {
  hot: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  high: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200',
  medium: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  low: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

export function IntentBadge({ label }: { label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
        intentMap[label] ?? intentMap.low
      )}
    >
      {label === 'hot' && '🔥 '}
      {label}
    </span>
  );
}

// ─── Source Badges ───────────────────────────────────────────────────
const sourceMap: Record<string, string> = {
  reddit: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200',
  twitter: 'bg-sky-50 text-sky-600 ring-1 ring-sky-200',
  linkedin: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
};

export function SourceBadge({ source }: { source: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
        sourceMap[source] ?? 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
      )}
    >
      {source}
    </span>
  );
}

// ─── Status Badges ───────────────────────────────────────────────────
const statusMap: Record<string, string> = {
  new: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
  contacted: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  qualified: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  converted: 'bg-green-50 text-green-600 ring-1 ring-green-200',
  dismissed: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
        statusMap[status] ?? statusMap.new
      )}
    >
      {status}
    </span>
  );
}

// ─── Generic Badge ───────────────────────────────────────────────────
const variantMap: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
  gray: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  green: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  yellow: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  red: 'bg-red-50 text-red-600 ring-1 ring-red-200',
};

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
