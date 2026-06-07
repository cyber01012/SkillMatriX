
'use client';

import React from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Card({ title, className, children }: CardProps) {
  return (
    <div className={clsx('ui-card', className)}>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}
