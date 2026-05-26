'use client';

import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  items: ToastItem[];
  show: (message: string, variant?: ToastVariant) => void;
  hide: (id: number) => void;
}

let toastCounter = 0;

const useToastStore = create<ToastState>()((set, get) => ({
  items: [],
  show: (message, variant = 'success') => {
    toastCounter += 1;
    const id = toastCounter;
    set((s) => ({ items: [...s.items, { id, message, variant }] }));
    setTimeout(() => get().hide(id), 3000);
  },
  hide: (id) => {
    set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
  },
}));

const VARIANT_STYLES: Record<
  ToastVariant,
  { bg: string; border: string; icon: typeof CheckCircle2; iconColor: string }
> = {
  success: {
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.45)',
    icon: CheckCircle2,
    iconColor: 'var(--green)',
  },
  error: {
    bg: 'rgba(248, 113, 113, 0.12)',
    border: 'rgba(248, 113, 113, 0.45)',
    icon: XCircle,
    iconColor: 'var(--red)',
  },
  info: {
    bg: 'var(--ube-tint)',
    border: 'rgba(123, 94, 167, 0.45)',
    icon: Info,
    iconColor: 'var(--ube-bright)',
  },
};

function ToastRow({ item }: { item: ToastItem }) {
  const styles = VARIANT_STYLES[item.variant];
  const Icon = styles.icon;
  return (
    <div
      role="status"
      className="ui-anim-toast-in flex items-start gap-3 min-w-[280px] max-w-[420px] rounded-[var(--radius-md)] px-4 py-3 backdrop-blur-md shadow-[var(--shadow-md)]"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
    >
      <Icon size={18} style={{ color: styles.iconColor, flexShrink: 0, marginTop: 1 }} />
      <div className="flex-1 text-[13px] leading-snug text-text-primary">
        {item.message}
      </div>
      <button
        type="button"
        onClick={() => useToastStore.getState().hide(item.id)}
        aria-label="닫기"
        className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const items = useToastStore((s) => s.items);
  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {items.map((item) => (
          <ToastRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export const toast = {
  show: (message: string, variant: ToastVariant = 'success') =>
    useToastStore.getState().show(message, variant),
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
};
