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
        className={['flex items-center justify-center gap-4 w-full py-8 rounded-3xl bg-navy-800 border border-white/10 text-slate-300 text-3xl font-black transition-all active:scale-95 active:bg-navy-700 disabled:opacity-40', className].join(' ')}
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
    primary: 'bg-ocean-400 text-white hover:bg-ocean-500 focus:ring-ocean-300/50',
    secondary: 'bg-navy-700 text-slate-200 hover:bg-navy-600 focus:ring-white/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
    ghost: 'bg-transparent text-white border-2 border-white/30 hover:bg-white/10 focus:ring-white/20',
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
