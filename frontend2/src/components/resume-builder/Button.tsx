'use client';

import React, { useState, forwardRef } from 'react';
import clsx from 'clsx';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'white';
type Size = 'sm' | 'md' | 'lg';

/** Own children explicitly to avoid React/Framer Motion prop clashes */
export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;   // spinner + disabled
  shine?: boolean;     // diagonal light sweep overlay
  ripple?: boolean;    // enable ripple
  children?: React.ReactNode; // ← explicit
}

const TheButton = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    className,
    loading = false,
    shine = true,
    ripple = true,
    disabled,
    children,
    onClick,
    type,               // may be undefined
    ...rest
  },
  ref
) {
  const [ripples, setRipples] = useState<
    { x: number; y: number; size: number; key: number }[]
  >([]);

  const onRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || disabled || loading) return;
    const btn = e.currentTarget;
    const size = Math.max(btn.clientWidth, btn.clientHeight);
    const x = e.nativeEvent.offsetX - size / 2;
    const y = e.nativeEvent.offsetY - size / 2;
    const key = Date.now();
    setRipples((prev) => [...prev, { x, y, size, key }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.key !== key));
    }, 550);
  };

  /** Sizes */
  const sizes: Record<Size, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  /** Variants (theme-aligned) */
  const variants: Record<Variant, string> = {
    primary: clsx(
      'bg-[#3D418A] text-white',
      'hover:bg-[#2F336F] active:bg-[#292D66]',
      'shadow-[0_12px_30px_-12px_rgba(61,65,138,0.45)]',
      'hover:shadow-[0_18px_40px_-12px_rgba(200,106,214,0.35)]',
      'ring-offset-2 focus:ring-2 focus:ring-[#26b2d1]/40 focus:outline-none'
    ),
    secondary: clsx(
      'bg-gradient-to-r from-[#26b2d1] via-[#3D418A] to-[#c86ad6] text-white',
      'hover:from-[#2bc2e1] hover:via-[#343782] hover:to-[#d07ae0]',
      'shadow-[0_14px_35px_-12px_rgba(38,178,209,0.45)]',
      'hover:shadow-[0_22px_45px_-14px_rgba(200,106,214,0.45)]',
      'ring-offset-2 focus:ring-2 focus:ring-[#26b2d1]/40 focus:outline-none'
    ),
    ghost: clsx(
      'bg-transparent text-[#3D418A]',
      'hover:bg-[#4144A3] hover:text-white',
      'ring-offset-2 focus:ring-2 focus:ring-[#26b2d1]/30 focus:outline-none'
    ),
    outline: clsx(
      'bg-transparent text-[#3D418A] border-2 border-[#4144A3]',
      'hover:bg-[#4144A3] hover:text-white',
      'ring-offset-2 focus:ring-2 focus:ring-[#26b2d1]/30 focus:outline-none'
    ),
    white: clsx(
      'bg-white text-[#3D418A]',
      'hover:bg-[#f0fff9]',
      'shadow-xl hover:shadow-2xl',
      'ring-offset-2 focus:ring-2 focus:ring-[#26b2d1]/25 focus:outline-none'
    ),
  };

  const base =
    'relative overflow-hidden font-bold rounded-full transition-all duration-300 active:scale-95 ' +
    'inline-flex items-center justify-center gap-2 cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-60';

  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type ?? 'button'}  // default to "button" to avoid accidental form submit
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      transition={{ duration: 0.16 }}
      className={clsx(base, sizes[size], variants[variant], className)}
      disabled={isDisabled}
      onClick={(e) => {
        onRipple(e);
        onClick?.(e);
      }}
      {...rest}
    >
      {/* Shine sweep */}
      {shine && !isDisabled && (
        <span aria-hidden className="btn-shine-container">
          <span className="btn-shine" />
        </span>
      )}

      {/* Ripple layers */}
      {ripple &&
        ripples.map((r) => (
          <span
            key={r.key}
            aria-hidden
            className="btn-ripple"
            style={{
              width: r.size,
              height: r.size,
              top: r.y,
              left: r.x,
            }}
          />
        ))}

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>

      {/* Top glossy overlay */}
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </motion.button>
  );
});

export default TheButton;