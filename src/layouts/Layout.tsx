import { Link, Outlet } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { Field, Label, Switch } from "@headlessui/react";
import type { Theme } from "../types/types";
import { LocationBar } from "../components/LocationBar";
import { LastUpdated } from "../components/LastUpdated";
import { CardSkeleton } from "../components/CardSkeleton";

/** Saved theme if there is a valid one, otherwise the system preference. */
function getInitialTheme(): Theme {
  const storedTheme: string | null = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  const prefersDarkTheme: boolean =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDarkTheme ? "dark" : "light";
}

export function Layout() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect((): void => {
    document.documentElement.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] min-h-screen transition-colors duration-200">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-6">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--text)] focus:px-3 focus:py-2 focus:text-[var(--bg)]"
        >
          Skip to content
        </a>
        <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[var(--border)] py-3">
          <div className="mr-auto">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              <Link to="/">UK Carbon Intensity</Link>
            </h1>
            <p className="text-xs text-[var(--muted)]">
              Live and forecast CO₂ from the British grid
            </p>
          </div>
          <LocationBar />
          <div className="flex items-center gap-4">
            <LastUpdated />
            <Field as="div" className="flex items-center gap-2">
              <Label className="sr-only">Dark mode</Label>
              <Switch
                checked={theme === "dark"}
                onChange={(): void =>
                  setTheme(
                    (prev: Theme): Theme => (prev === "light" ? "dark" : "light"),
                  )
                }
                className={({ checked }: { checked: boolean }): string =>
                  `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    checked
                      ? "bg-[var(--switch-track-checked)]"
                      : "bg-[var(--switch-track)]"
                  }`
                }
              >
                <span
                  className={`${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                />
              </Switch>
            </Field>
          </div>
        </header>
        <main className="flex-1 py-4 sm:py-5" id="content" tabIndex={-1}>
          <Suspense fallback={<CardSkeleton label="Loading" bodyHeight="h-48" />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="pb-6 text-xs text-[var(--muted)]">
          Data from{" "}
          <a
            href="https://carbonintensity.org.uk"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[var(--link-hover)]"
          >
            National Grid ESO Carbon Intensity API
          </a>
          . Times shown in your local time.
        </footer>
      </div>
    </div>
  );
}
