import { useEffect, useMemo, useState } from 'react';
import { IconBell, IconCheck, IconClose, IconWarning } from '@/shared/assets/icons.js';

const TOAST_EVENT_NAME = 'mirum:toast';
const TOAST_DURATION_MS = 2600;

const getToastTone = (type) => {
  if (type === 'error') {
    return {
      wrap: 'border-destructive/25 bg-card',
      iconWrap: 'bg-destructive/10 text-destructive',
      title: 'text-destructive',
    };
  }
  if (type === 'success') {
    return {
      wrap: 'border-success/25 bg-card',
      iconWrap: 'bg-success/10 text-success',
      title: 'text-success',
    };
  }
  return {
    wrap: 'border-primary/25 bg-card',
    iconWrap: 'bg-primary/10 text-primary',
    title: 'text-primary',
  };
};

const getToastIcon = (type) => {
  if (type === 'error') return IconWarning;
  if (type === 'success') return IconCheck;
  return IconBell;
};

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    /** @param {CustomEvent<{type?: string, message?: string}>} event */
    const handleToast = (event) => {
      const message = event?.detail?.message;
      if (!message) return;

      const nextToast = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: event?.detail?.type || 'info',
        message,
      };
      setToasts((prev) => [...prev, nextToast]);
    };

    window.addEventListener(TOAST_EVENT_NAME, handleToast);
    return () => window.removeEventListener(TOAST_EVENT_NAME, handleToast);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, TOAST_DURATION_MS),
    );

    return () => timers.forEach((timerId) => window.clearTimeout(timerId));
  }, [toasts]);

  const renderedToasts = useMemo(() => toasts.slice(-4), [toasts]);

  if (renderedToasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-[120] flex w-[340px] flex-col gap-3">
      {renderedToasts.map((toast) => {
        const tone = getToastTone(toast.type);
        const Icon = getToastIcon(toast.type);
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ring-1 ring-black/5 ${tone.wrap}`}
          >
            <div className={`mt-0.5 rounded-lg p-1.5 ${tone.iconWrap}`}>
              <Icon size={14} />
            </div>
            <p className={`min-w-0 flex-1 text-sm font-semibold leading-5 ${tone.title}`}>
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
              className="rounded-md p-1 text-muted-foreground/60 transition hover:bg-muted hover:text-muted-foreground"
              aria-label="toast 닫기"
            >
              <IconClose size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
