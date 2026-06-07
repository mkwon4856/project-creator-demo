'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: AlertVariant;
  icon?: ReactNode;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  info: 'bg-primary-dim border-l-4 border-l-primary',
  success: 'bg-success/12 border-l-4 border-l-success',
  warning: 'bg-warning/12 border-l-4 border-l-warning',
  danger: 'bg-danger/12 border-l-4 border-l-danger',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant = 'info', icon, children, className = '', role = 'alert', ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role={role}
      className={[
        'rounded-lg px-4 py-3 text-xs leading-relaxed text-text-primary',
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <div className="flex items-start gap-2.5">
        {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
});

Alert.displayName = 'Alert';
