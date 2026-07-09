import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'border border-accent bg-accent text-bg hover:bg-accent/90',
  ghost: 'border border-white/20 bg-transparent text-offwhite hover:border-accent hover:text-accent',
  danger: 'border border-red-500/50 bg-red-500 text-white hover:bg-red-400',
  icon: 'border border-white/10 bg-white/5 text-offwhite hover:bg-white/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-[11px] uppercase tracking-[0.28em]',
  md: 'px-5 py-3 text-[11px] uppercase tracking-[0.28em]',
  lg: 'px-6 py-4 text-[12px] uppercase tracking-[0.3em]',
};

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button',
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-none font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
