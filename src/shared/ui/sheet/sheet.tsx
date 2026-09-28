import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import "./sheet.css";

type SheetProps = {
  onClose: () => void;
  label: string;
  menuBelow?: RefObject<HTMLElement | null>;
  children: ReactNode;
};

const menuGap = 8;

export function Sheet({ onClose, label, menuBelow, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    const anchor = menuBelow?.current?.getBoundingClientRect();
    if (anchor) {
      dialog.style.setProperty("--sheet-top", `${anchor.bottom + menuGap}px`);
      dialog.style.setProperty("--sheet-right", `${document.documentElement.clientWidth - anchor.right}px`);
    }
    dialog.showModal();
    return () => {
      dialog.close();
      opener?.focus();
    };
  }, [menuBelow]);

  return (
    <dialog
      ref={ref}
      className="group/sheet fixed inset-x-0 top-auto bottom-0 m-0 box-border max-h-[60dvh] w-full max-w-none overflow-y-auto rounded-t-card border-0 bg-surface p-0 text-ink shadow-sheet backdrop:bg-ink/30 open:animate-[sheet-up_var(--duration-sheet)_var(--ease-out)] open:backdrop:animate-[sheet-fade_var(--duration-sheet)_var(--ease-out)] lg:data-menu:top-(--sheet-top) lg:data-menu:right-(--sheet-right) lg:data-menu:bottom-auto lg:data-menu:left-auto lg:data-menu:w-80 lg:data-menu:rounded-control lg:data-menu:shadow-menu lg:data-menu:backdrop:bg-transparent lg:data-menu:open:animate-[sheet-menu-in_var(--duration-menu)_var(--ease-out)]"
      aria-label={label}
      data-sheet
      data-menu={menuBelow ? true : undefined}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="grid gap-1 px-5 pt-3 pb-[calc(--spacing(8)+env(safe-area-inset-bottom))] lg:group-data-menu/sheet:p-2">
        <span className="mx-auto mb-2 block h-1 w-10 rounded-pill bg-line lg:group-data-menu/sheet:hidden" aria-hidden="true" />
        {children}
      </div>
    </dialog>
  );
}
