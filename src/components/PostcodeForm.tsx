import { useId, useState, type FormEvent } from "react";
import { toOutcode } from "../utils/postcode";

type PostcodeFormProps = {
  onSubmit: (outcode: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
};

export function PostcodeForm({
  onSubmit,
  initialValue = "",
  autoFocus = false,
}: PostcodeFormProps) {
  const [value, setValue] = useState<string>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const outcode = toOutcode(value);
    if (!outcode) {
      setError("Enter a UK postcode, like SW1A 1AA or just SW1A.");
      return;
    }
    setError(null);
    onSubmit(outcode);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className="block text-sm text-[var(--muted)] mb-1.5">
        Your postcode
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. SW1A 1AA"
          autoComplete="postal-code"
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-[var(--muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--switch-track-checked)]"
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-lg bg-[var(--text)] px-3 py-2 text-sm font-medium text-[var(--bg)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--switch-track-checked)]"
        >
          Show my area
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-400">
          {error}
        </p>
      )}
      <p className="mt-1.5 text-xs text-[var(--muted)]">
        Only the first half (e.g. SW1A) is used, to find your grid region.
      </p>
    </form>
  );
}
