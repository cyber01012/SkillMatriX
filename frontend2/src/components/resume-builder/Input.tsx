'use client';

import React, { forwardRef } from 'react';
import clsx from 'clsx';

export type RBInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  id?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

const Input = forwardRef<HTMLInputElement, RBInputProps>(function RBInput(
  { label, id, error, hint, className, wrapperClassName, ...props },
  ref
) {
  // If you want a bare input, you can return just the input + ref:
  // return <input ref={ref} className={clsx('input', className)} {...props} />;

  // If you render label + hint, keep it like this:
  return (
    <label className={clsx('block', wrapperClassName)} htmlFor={id}>
      {label && (
        <span className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </span>
      )}

      <input
        id={id}
        ref={ref}
        className={clsx('input', className)}
        {...props}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </label>
  );
});

export default Input;