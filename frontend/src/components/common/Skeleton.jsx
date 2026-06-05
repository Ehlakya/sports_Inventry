import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4 bg-white dark:bg-slate-900 shadow-sm">
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex gap-3">
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 w-12" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-4 w-full p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
    <div className="flex justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
      {Array(cols).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-6 flex-grow" />
      ))}
    </div>
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} className="flex justify-between gap-4 items-center py-1">
        {Array(cols).fill(0).map((_, j) => (
          <Skeleton key={j} className="h-8 flex-grow" />
        ))}
      </div>
    ))}
  </div>
);
