import React from "react";

export function TeaPage(): React.ReactElement {
  return (
    <React.Fragment>
      <header className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Tea optimiser
        </h1>
        <p className="text-[var(--muted)] text-sm mt-1">
          Should you boil the kettle right now?
        </p>
      </header>

      <main>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <p className="text-[var(--muted)]">
            Coming soon — check back next session
          </p>
        </div>
      </main>
    </React.Fragment>
  );
}
