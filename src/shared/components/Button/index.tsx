import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'back';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  if (variant === 'back') {
    return (
      <button
        className={['flex items-center justify-center gap-4 w-full py-8 rounded-3xl bg-white border-2 border-gray-200 text-gray-500 text-3xl font-black transition-all active:scale-95 active:bg-gray-50 disabled:opacity-40', className].join(' ')}
        {...props}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M5 12l7 7M5 12l7-7" />
        </svg>
        {children}
      </button>
    );
  }

  const base =
    'font-bold rounded-2xl transition-colors focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-blue text-white hover:bg-brand-blue-dark focus:ring-brand-blue/30',
    secondary: 'bg-brand-blue-pale text-brand-blue hover:bg-blue-100 focus:ring-brand-blue/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
    ghost: 'bg-transparent text-brand-blue border-2 border-brand-blue/30 hover:bg-brand-blue-pale focus:ring-brand-blue/20',
  };

  const sizes = {
    md: 'px-6 py-3 text-lg',
    lg: 'px-10 py-5 text-2xl',
  };

  return (
    <button
      className={[base, variants[variant as keyof typeof variants], sizes[size], fullWidth ? 'w-full' : '', className].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
