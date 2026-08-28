import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus:ring-2 focus:ring-cyan-500/50',
  {
    variants: {
      variant: {
        default: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold',
        secondary:
          'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800',
        ghost: 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200',
        dark: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
      },
      size: {
        default: 'h-9 px-6',
        sm: 'h-8 px-4 text-[11px] uppercase tracking-wider',
        lg: 'h-11 px-8 text-[13px]',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
