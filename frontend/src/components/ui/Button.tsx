import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-black hover:brightness-95',
  ghost: 'border border-white/20 bg-transparent text-white hover:bg-white/5',
  danger: 'bg-red-500 text-white hover:bg-red-400',
  icon: 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
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
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-transform duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
