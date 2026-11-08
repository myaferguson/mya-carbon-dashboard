import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useLocationContext } from "../context/locationContext";
import { PostcodeForm } from "./PostcodeForm";

export function LocationBar() {
  const { outcode, setOutcode, region, regionLoading, regionError } =
    useLocationContext();

  let place: string = "Great Britain";
  if (outcode && region) place = `${region.name} · ${outcode}`;
  else if (outcode && regionLoading) place = `${outcode} · loading…`;
  else if (outcode && regionError) place = `${outcode} · area not found`;

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
      <span aria-hidden="true">📍</span>
      <span className="sr-only">Showing</span>
      <span className="font-medium" data-testid="location-name">
        {place}
      </span>
      <Popover className="relative">
        <PopoverButton className="rounded px-1.5 py-0.5 text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--switch-track-checked)]">
          {outcode ? "Change" : "Set your postcode"}
        </PopoverButton>
        <PopoverPanel
          anchor={{ to: "bottom start", gap: 8 }}
          className="z-20 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 shadow-xl"
        >
          {({ close }) => (
            <div className="space-y-3">
              <PostcodeForm
                autoFocus
                initialValue={outcode ?? ""}
                onSubmit={(next) => {
                  setOutcode(next);
                  close();
                }}
              />
              {outcode && (
                <button
                  type="button"
                  onClick={() => {
                    setOutcode(null);
                    close();
                  }}
                  className="text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]"
                >
                  Use national (GB) figures instead
                </button>
              )}
            </div>
          )}
        </PopoverPanel>
      </Popover>
    </div>
  );
}
