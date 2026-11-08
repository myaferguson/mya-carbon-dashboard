import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import type { ReactNode } from "react";

type InfoTipProps = {
  /** Accessible name for the button, e.g. "What does gCO₂/kWh mean?". */
  label: string;
  children: ReactNode;
};

/** A small ⓘ button that opens a plain-language explanation. */
export function InfoTip({ label, children }: InfoTipProps) {
  return (
    <Popover as="span" className="relative inline-block align-middle">
      <PopoverButton
        aria-label={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-xs text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--text)]"
      >
        i
      </PopoverButton>
      <PopoverPanel
        anchor={{ to: "bottom", gap: 8 }}
        className="z-20 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm leading-relaxed text-[var(--text)] shadow-xl"
      >
        {children}
      </PopoverPanel>
    </Popover>
  );
}
