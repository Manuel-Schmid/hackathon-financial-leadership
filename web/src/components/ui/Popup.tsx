import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  title: string;
  sub?: ReactNode;
  footer?: ReactNode;
  /** Tailwind-Breite, z. B. w-[780px]. */
  width?: string;
  onClose(): void;
  children: ReactNode;
}

/**
 * Popup im Stil von Filter und Kurzkarte. Das native <dialog> liegt über allem (auch dem Würfel),
 * hält die Tastatur im Popup und schliesst mit Esc. Klick neben das Popup schliesst ebenfalls.
 */
export function Popup({ title, sub, footer, width = 'w-[480px]', onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`card m-auto max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto p-0 text-text shadow-pop backdrop:bg-ink/45 ${width}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button
        type="button"
        aria-label="Schliessen"
        title="Schliessen"
        className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full text-[24px] leading-none hover:bg-line-soft hover:text-bad"
        onClick={onClose}
      >
        ×
      </button>
      <header className="px-6 pb-3 pr-12 pt-5">
        <h2 className="font-title text-[20px] font-semibold leading-tight">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}
      </header>
      <div className="px-6 pb-5">{children}</div>
      {footer && <footer className="flex flex-wrap items-center gap-2 border-t border-line px-6 py-3.5">{footer}</footer>}
    </dialog>
  );
}
