import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Field, Label, Switch } from "@headlessui/react";
import type { Theme } from "../types/types";

export function Layout() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect((): void => {
    const storedTheme: Theme = localStorage.getItem("theme") as Theme;

    if (storedTheme) {
      setTheme(storedTheme);
      return;
    }

    const prefersDarkTheme: boolean =
      window &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(prefersDarkTheme ? "dark" : "light");
  }, []);

  useEffect((): void => {
    document.documentElement.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] min-h-screen transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 min-h-screen flex flex-col">
        <div className="flex items-center justify-between pt-4">
          <nav className="flex gap-1">
            <TabLink to="/" label="Dashboard" />
            <TabLink to="/tea" label="Tea optimiser" />
          </nav>

          <Field as="div" className="flex items-center gap-2">
            <Label className="text-sm text-[var(--muted)]">
              {theme === "light" ? "Light mode" : "Dark mode"}
            </Label>
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
        <div className="border-b border-[var(--border)] mt-2" />
        {/* flex 1 allows the main content area to grow and fill the available
        vertical space, pushing the footer to the bottom of the page. */}
        <div className="py-8 sm:py-10 flex-1">
          {/* render the matched child route component */}
          <Outlet />
        </div>
        <footer className="pb-10 text-[var(--muted)] text-sm">
          Data from{" "}
          <a
            href="https://carbonintensity.org.uk"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[var(--link-hover)]"
          >
            National Grid ESO Carbon Intensity API
          </a>
        </footer>
      </div>
    </div>
  );
}

function TabLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }: { isActive: boolean }) =>
        `px-4 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "text-[var(--text)] border-b-2 border-[var(--text)] -mb-px"
            : "text-[var(--muted)] hover:text-[var(--text)]"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
