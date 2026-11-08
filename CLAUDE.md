# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

UK carbon intensity dashboard, appliance planner and "tea optimiser": React 19 + TypeScript + Vite + Tailwind v4, with data from the public National Grid ESO Carbon Intensity API (`https://api.carbonintensity.org.uk`, no key). It deploys to Vercel automatically from `main`.

## Commands

```bash
npm run dev                                  # Vite dev server, http://localhost:5173
npm run build                                # tsc -b (type check) + vite build
npm run lint                                 # ESLint (includes react-hooks + react-refresh rules)
npm test                                     # Vitest, once (tests/**/*.test.{ts,tsx} only)
npx vitest run tests/planner.test.ts         # one test file
npx vitest run -t "findBestWindow"           # tests matching a name
npm run test:e2e                             # Playwright (starts its own dev server on :5180)
npx playwright test e2e/planner.spec.ts -g "EV"   # one e2e test
```

- The Husky pre-commit hook runs `npm run build && npm run test`, so commits fail on type or test errors.
- Locally, Playwright uses the installed Google Chrome (`channel: "chrome"`). With `CI` set it expects Playwright's Chromium (`npx playwright install chromium`).
- GitHub Actions (`.github/workflows/ci.yml`) runs lint, unit tests, build and e2e on PRs and on pushes to `main`.

## TypeScript

Strict mode is on in both tsconfigs (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`). Indexing an array gives `T | undefined`, so guard first/last elements (`arr[0]`, `arr.at(-1)`) rather than using `!`. `BestWindow.periods` is a non-empty tuple, so `best.periods[0]` is safe. The only deliberate `as` is `response.json() as TJson` in `useApiData`, where the untyped API data enters the app; transforms guard the known bad shapes instead. API response types include the nulls the API really returns (e.g. `RegionalForecastResponse.data` can be `null`).

## Architecture

### Data flow
`API → useApiData (TanStack Query) → data hooks → pages/components`. Pure logic lives in `src/utils/`.

- **`src/hooks/useApiData.ts`** handles every request. It's TanStack Query keyed by **URL only**, so:
  - each URL must always be paired with the same `transform`;
  - transforms must be stable, module-level functions.
  - Passing `null` as the URL skips fetching.
  - Data refreshes every 30 min and on window focus.
  - When the URL changes and the old and new URLs differ only by their timestamps, the previous data stays on screen while the new data loads (`placeholderData`). This keeps the half-hour rollover flicker-free without leaking one postcode's data into another.
  - Returns `{ data, loading, error, refetch, updatedAt }`, where `error` is a friendly message and the real error is `console.error`ed.
- **Data hooks** (`useCarbonIntensity`, `useGenerationMix`, `useIntensityForecast`, `useRegions`) return the **same shapes for national and regional data**, so pages never branch on location.
  - Each hook calls both the national and the regional `useApiData`, with one of the URLs `null`.
  - Regional current intensity and fuel mix come from a single request made in `LocationProvider`, exposed through context.
- **Forecast URLs are rounded to the half hour** (`startOfHalfHour` + `useNow`). This lets pages share the cache and roll over to the next half hour automatically.
  - Nationally: `/intensity/{now-24h}/{now+24h}`, with actual values for the past.
  - Regionally: `/regional/intensity/{now}/fw48h/postcode/{outcode}`. This is **forecast-only**: `actual` is always `null`. UI that shows actual values (chart title and legend, "Forecast only" label) checks for this.

### Location (postcode)
- **`src/context/locationContext.ts`** holds the context, hook and types. **`LocationProvider.tsx`** is the component. They're split because `react-refresh/only-export-components` forbids mixing components and other exports in one file. The same rule is why chart helpers live in `utils/chart.ts`.
- **Postcode sources:** `?postcode=` in the URL, then `localStorage["postcode"]`, then national. Changes are written back to both. Navigation drops the query string, so an effect re-adds it.
- **The API only accepts the outward code** (`SW1A`, not `SW1A 1AA`). `toOutcode()` in `utils/postcode.ts` normalises input.
- **Unknown postcodes fail in two ways:** a 400 with no CORS header (the browser reports a CORS error), or a 200 with `data: null` (the transforms throw a clear error). `DashboardPage` collapses these into one "We couldn't find data for X" alert.

### Planner and time logic (`src/utils/planner.ts`)
- **`findBestWindow(periods, slots, { now, deadline })`** is a sliding window over consecutive, not-yet-finished half hours.
  - Gaps in the data break a window. Ties go to the earliest window. `actual ?? forecast` is preferred.
  - It powers the dashboard summary (`summariseForecast`), the Tea page's best brew time and `/planner`.
- **Planner state lives entirely in the URL**: `appliance`, `hours`, `kwh`, `by`, read and written with `useSearchParams` functional updates. That keeps it compatible with `LocationProvider`'s `postcode` param. Presets and parsing are in `utils/appliances.ts`.
- **Time in render:** `react-hooks/purity` lint forbids `Date.now()` in render. Use `useNow()`, which ticks every minute, and pass `now` into pure functions.
- **Times are shown in the visitor's local timezone** via `en-GB` formatting (`utils/formatTime.ts`: `formatClock`, `formatClockWithDay`, `dayLabel`). API timestamps are minute-precision UTC: `toApiTime()` gives `2026-11-08T22:30Z`.

### Code splitting
Pages are `React.lazy` in `App.tsx`, inside a `Suspense` in `Layout`. On the Dashboard, `IntensityTrendChart` and `GenerationMixChart` are lazy as well, because Recharts is the largest dependency. Keep Recharts out of anything imported by the Planner or Tea pages.

### Styling and theme
- Tailwind v4, with colours from CSS variables in `src/index.css`. Light mode is the `.theme-light` class on `<html>`, toggled in `Layout`.
- Intensity-level colours are `var(--index-<level>-{bg|text|border})`, where `<level>` is `index.replace(" ", "-")`, e.g. `very-high`. Use `var(--good)` for positive figures. Don't hard-code colours: both themes must pass axe contrast checks.
- `index.css` also holds the global `:focus-visible` ring and the `prefers-reduced-motion` overrides. Charts pass `isAnimationActive={!usePrefersReducedMotion()}`.

## Testing conventions

- **Component and page tests** mock the data hooks by module path, e.g. `vi.mock("../src/hooks/useIntensityForecast", …)`. Anything that renders `App` must mock every data hook it reaches. `App.test` uses `findBy*` because pages are lazy.
- **Tests that call `useApiData` for real** (hook and provider tests) need the wrapper from `tests/support/queryWrapper.tsx`. Components that use `Link` or `useSearchParams` need a `MemoryRouter`.
- **Time-dependent tests** use `vi.useFakeTimers({ toFake: ["Date"] })` + `vi.setSystemTime(...)`, so only `Date` is faked and Testing Library's `waitFor` still works. Build timestamps from local times (`new Date(y, m, d, h, min).toISOString()`) so the tests pass in any timezone.
- **E2E** (`e2e/`): `mockApi(page)` in `e2e/mockApi.ts` freezes the clock at `NOW` (16 May 2026, 21:10 London) and answers every API path with fixtures.
  - National: low (80) from 02:00 to 06:00.
  - London `SW1A`: 120 from 03:00 to 05:00.
  - Every other postcode is unknown.
  - Playwright pins `timezoneId: "Europe/London"`.
  - Expected times and numbers in the specs follow from these fixtures, so update both together.
- **Accessibility:** `e2e/accessibility.spec.ts` requires **zero axe violations** (WCAG 2 A/AA + best practice) on every page in both themes.

## Deployment notes

`vercel.json` rewrites every path to `/` for client-side routing. A static file therefore has to exist in `public/` (e.g. `robots.txt`, `favicon.svg`), or Vercel serves `index.html` in its place.
