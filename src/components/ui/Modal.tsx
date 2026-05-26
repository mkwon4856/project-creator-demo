'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  /** Overlay click closes modal. Default true */
  closeOnOverlayClick?: boolean;
  /** ESC closes modal. Default true */
  closeOnEsc?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
}

const SIZE_MAX_WIDTH: Record<ModalSize, number> = {
  sm: 480,
  md: 640,
  lg: 920,
  xl: 1080,
};

function ModalRoot({
  open,
  onClose,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  ariaLabel,
  ariaLabelledBy,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const handleOverlayMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!closeOnOverlayClick) return;
      if (e.target === e.currentTarget) onClose();
    },
    [closeOnOverlayClick, onClose],
  );

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    // Always reset to '' on cleanup so a stale 'hidden' from nested/quickly-
    // unmounted modals can never leave the page locked.
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  const portalTarget = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return document.body;
  }, []);

  if (!open || !portalTarget) return null;

  return createPortal(
    <div
      onMouseDown={handleOverlayMouseDown}
      className="fixed inset-0 z-50 flex md:items-start justify-center md:overflow-y-auto md:p-10 bg-black/70 md:backdrop-blur-sm ui-anim-fade-in"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className="w-full h-screen md:h-auto md:my-auto bg-bg-card border-0 md:border md:border-white/10 rounded-none md:rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] flex flex-col max-h-screen md:max-h-[calc(100vh-80px)] overflow-hidden ui-anim-scale-in focus:outline-none"
        style={{ maxWidth: SIZE_MAX_WIDTH[size] }}
      >
        {children}
      </div>
    </div>,
    portalTarget,
  );
}

function ModalHero({
  className = '',
  children,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'px-6 py-5 border-b border-white/10 text-text-primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background:
          'linear-gradient(135deg, var(--ube-tint-strong), var(--ube-tint))',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function ModalBody({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['flex-1 overflow-y-auto px-6 py-5', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

function ModalFooter({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'px-6 py-4 border-t border-white/10 flex items-center justify-end gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

type ModalComponent = typeof ModalRoot & {
  Hero: typeof ModalHero;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
};

export const Modal = ModalRoot as ModalComponent;
Modal.Hero = ModalHero;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
