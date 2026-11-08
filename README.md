# UK Carbon Intensity Dashboard

[![CI](https://github.com/myaferguson/mya-carbon-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/myaferguson/mya-carbon-dashboard/actions/workflows/ci.yml)

How clean is the electricity where you live right now, and when should you run the washing machine, charge the car or boil the kettle?

**Live**: [mya-carbon-dashboard.vercel.app](https://mya-carbon-dashboard.vercel.app/)

![The whole app on one page: summary tiles, the 48-hour chart beside the planner, fuel mix and regions](./docs/screenshot.png)

## What it does

- **Tells you what to do, in one sentence.** "Very high right now · 277 gCO₂/kWh. It'll be 22% cleaner at 21:30 tomorrow."
- **Shows your area.** Enter a postcode to switch every figure to your grid region, and see how it compares with the other 13 regions and the GB average. The postcode is remembered and kept in the URL, so you can share a link.
- **Plans your appliances.** Choose a kettle, washing machine, dishwasher, tumble dryer, EV charge or your own appliance, and optionally a "finish by" time. The planner finds the cleanest run of consecutive half hours, outlines it on the chart, and tells you how much CO₂ waiting saves.
- **Shows the trend.** A 48-hour chart: actual intensity for the last 24 hours and the forecast for the next 24, with a "Now" line and shading by intensity level. Export it as PNG or CSV, or read it as a table.
- **Explains the numbers.** ⓘ popovers explain gCO₂/kWh and the five intensity levels in plain English.
- **Still answers the original question.** The project started as a "tea optimiser". The kettle is now the planner's default appliance, with CO₂ per cup and a phone-charge comparison, and old `/tea` links open it.

Everything is on **one page**. On a laptop, the headline figures, the chart and the planner all fit on the first screen.

| Your area, planning an EV charge | Mobile |
|---|---|
| ![London selected: EV charge planned to finish by 07:00, outlined on the chart, with London highlighted among the regions](./docs/your-area.png) | ![The dashboard on a phone: summary first, then the planner](./docs/mobile.png) |

All data comes from the National Grid ESO's free [Carbon Intensity API](https://carbonintensity.org.uk/).

## Why

A side project to build a small, real-world data dashboard using a modern frontend stack — and to put my chemical engineering interest in decarbonisation to practical use.

## How it's built

```mermaid
flowchart LR
  API[(Carbon Intensity API)]
  subgraph Data
    Q[useApiData<br/>TanStack Query cache]
    H[useCarbonIntensity<br/>useGenerationMix<br/>useIntensityForecast<br/>useRegions]
    L[LocationProvider<br/>postcode ↔ URL + localStorage]
  end
  subgraph Logic["Pure functions (unit tested)"]
    P[findBestWindow<br/>summariseForecast]
    O[toOutcode]
  end
  subgraph UI["One page"]
    S[Summary tiles]
    C[48h chart]
    PL[Planner<br/>usePlannerState ↔ URL]
    R[Fuel mix + regions]
  end
  API --> Q --> H
  L --> H
  H --> S & C & PL & R
  P --> S & PL
  PL -- best window --> C
  O --> L
```

- **React 19**, **TypeScript**, **Vite** and **Tailwind CSS v4**
- **TanStack Query** for fetching, caching and refreshing data
- **Recharts** for the 48-hour chart. The fuel-mix and region bars are plain HTML and CSS.
- **Headless UI** for the accessible popovers, radio group, menu and switch
- Deployed on **Vercel**. Every push to `main` deploys.

### Decisions worth explaining

**One data hook, many endpoints.** Every request goes through `useApiData`, which uses TanStack Query underneath. The three data hooks return the same shapes whether they're showing national or regional data, so pages and components don't know or care which one they've got. Switching to your postcode is a context change, not a rewrite.

**Shared, self-refreshing data.** Each URL is fetched once and shared across pages, so moving from Dashboard to Planner makes no new requests. Forecast URLs are rounded to the half hour, matching how often the API publishes. They roll over automatically when the next half hour starts, and keep showing the previous data until the new data arrives, so nothing flickers. Data also refreshes every 30 minutes and when you come back to the tab.

**The planner is a sliding-window search.** `findBestWindow(periods, slots, { now, deadline })` checks every run of `slots` consecutive half hours that hasn't finished yet and ends before the deadline, and picks the one with the lowest average. If the data has a gap, the run is skipped, and ties go to the earliest start. It's a small pure function with its own tests, and the summary tiles use it too.

**One page instead of three tabs.** The site used to have Dashboard, Planner and Tea tabs, and each re-showed the same forecast. A review of comparable tools showed a common pattern: headline figures first, then the forecast with the "best time" control right beside it. Examples include carbonintensity.org.uk, Kate Morley's GB grid, energydashboard.co.uk, Octopus Watch and CAISO's Today's Outlook. So the tabs became one page. The planner's choice is drawn on the chart, the kettle became a planner preset, and `/planner` and `/tea` redirect to the planner with the matching appliance. At 1440×900 the page went from using 49% of the width and 2.7 screens of scrolling to 77% and 1.3 screens. On phones it stacks in the same order it reads: summary, planner, chart, fuel mix, regions.

**Regional data is forecast-only.** The regional API has no actual readings, so for a postcode the chart changes from "last 24h & next 24h" to "next 48h" and says why. The current figure is labelled "Forecast only". Unknown postcodes come back from the API in two different ways (a 400 error, or a 200 with no data). Both are handled, and the page shows one clear message.

**Everything you choose is shareable.** Postcode, appliance, charge length and finish time all live in the URL, for example `/planner?postcode=SW1A&appliance=ev&hours=4&by=07:00`.

**The heavy part loads last.** The charting library is the largest dependency, so the chart is lazy-loaded. The summary tiles and planner appear first, and the chart fills in when it's ready.

## Quality

| | |
|---|---|
| **Type safety** | Strict TypeScript (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`). No `any` or `!`, and one documented `as` where untyped API data enters the app. |
| **Unit and component tests** | 94 tests (Vitest + Testing Library): the planner, postcode parsing, regional data mapping, URL and localStorage state, the hooks, and key components |
| **End-to-end tests** | 17 Playwright tests against a mocked API with a frozen clock, so every expected number and time is fixed: summary, postcode flow, unknown postcode, theme persistence, EV planning with a deadline, the chart highlight, old `/tea` links, regional planning, mobile layout |
| **Accessibility** | axe (WCAG 2 A/AA + best practice) reports **0 violations** in light and dark mode, national and regional, checked in CI. The chart has a text summary and a table view, every control has a visible focus ring, there's a skip link, reading order matches visual order on every screen size, and animations respect reduced-motion settings. |
| **Lighthouse** (production build) | Desktop: Performance 98, Accessibility 100, Best practices 100, SEO 100. Mobile: Performance 77–88 (most of the remaining time is waiting for the live API), Accessibility 100, Best practices 100, SEO 100. |
| **CI** | GitHub Actions runs lint, unit tests, build and end-to-end tests on every pull request |

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit and component tests
npm run test:e2e   # end-to-end tests (uses your installed Chrome)
npm run lint
npm run build
```

## Project layout

```
src/
  pages/        DashboardPage: the single page and its grid
  components/   Summary tiles, chart, planner, fuel mix, regions, popovers
  hooks/        useApiData + one hook per data source, usePlannerState, useNow
  context/      LocationProvider (postcode ↔ URL + localStorage)
  utils/        Pure logic: planner, postcode, regional mapping, formatting
tests/          Vitest unit and component tests
e2e/            Playwright tests and the mocked API
```

## What's next

- 24-hour fuel-mix history as a stacked chart (`/generation/{from}/pt24h`)
- "Why is it high right now?": each fuel's share × its CO₂ per kWh (`/intensity/factors`)
- A weekly heatmap of the cleanest times
- A map of the regions

## Author

[Mya Ferguson](https://github.com/myaferguson)
