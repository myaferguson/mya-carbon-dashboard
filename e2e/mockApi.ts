import type { Page, Route } from "@playwright/test";

/**
 * A fixed "now" for every test: Saturday 16 May 2026, 21:10 in London
 * (20:10 UTC). Combined with the mocked API below, every number and time
 * on screen is predictable.
 */
export const NOW = new Date("2026-05-16T20:10:00Z");

const HALF_HOUR = 30 * 60 * 1000;
const API = "https://api.carbonintensity.org.uk";

const londonHour = (t: Date): number =>
  Number(
    t.toLocaleString("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      hourCycle: "h23",
    }),
  );

const iso = (t: Date): string => `${t.toISOString().slice(0, 16)}Z`;

/** National: 80 (low) from 02:00 to 06:00 London time, otherwise 250 (high). */
function nationalValue(t: Date): { forecast: number; index: string } {
  const h = londonHour(t);
  return h >= 2 && h < 6
    ? { forecast: 80, index: "low" }
    : { forecast: 250, index: "high" };
}

/** London: 120 (moderate) from 03:00 to 05:00, otherwise 300 (very high). */
function londonValue(t: Date): { forecast: number; index: string } {
  const h = londonHour(t);
  return h >= 3 && h < 5
    ? { forecast: 120, index: "moderate" }
    : { forecast: 300, index: "very high" };
}

function halfHours(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  for (let t = from.getTime(); t < to.getTime(); t += HALF_HOUR) out.push(new Date(t));
  return out;
}

const mix = [
  { fuel: "gas", perc: 50 },
  { fuel: "wind", perc: 30 },
  { fuel: "nuclear", perc: 20 },
  { fuel: "biomass", perc: 0 },
  { fuel: "coal", perc: 0 },
  { fuel: "imports", perc: 0 },
  { fuel: "other", perc: 0 },
  { fuel: "hydro", perc: 0 },
  { fuel: "solar", perc: 0 },
];

const currentFrom = new Date(Math.floor(NOW.getTime() / HALF_HOUR) * HALF_HOUR);
const currentTo = new Date(currentFrom.getTime() + HALF_HOUR);
const london = { regionid: 13, dnoregion: "UKPN London", shortname: "London" };

function respond(path: string): { status: number; body: unknown } {
  let m: RegExpMatchArray | null;

  if (path === "/intensity") {
    return {
      status: 200,
      body: {
        data: [
          {
            from: iso(currentFrom),
            to: iso(currentTo),
            intensity: { forecast: 250, actual: 248, index: "high" },
          },
        ],
      },
    };
  }

  if (path === "/generation") {
    return { status: 200, body: { data: { from: iso(currentFrom), to: iso(currentTo), generationmix: mix } } };
  }

  if ((m = path.match(/^\/intensity\/([^/]+)\/([^/]+)$/))) {
    const [, from = "", to = ""] = m;
    const periods = halfHours(new Date(from), new Date(to)).map((t) => {
      const { forecast, index } = nationalValue(t);
      const finished = t.getTime() + HALF_HOUR <= NOW.getTime();
      return {
        from: iso(t),
        to: iso(new Date(t.getTime() + HALF_HOUR)),
        intensity: { forecast, actual: finished ? forecast - 2 : null, index },
      };
    });
    return { status: 200, body: { data: periods } };
  }

  if (path === "/regional") {
    const region = (regionid: number, shortname: string, forecast: number, index: string) => ({
      regionid,
      dnoregion: shortname,
      shortname,
      intensity: { forecast, index },
      generationmix: mix,
    });
    return {
      status: 200,
      body: {
        data: [
          {
            from: iso(currentFrom),
            to: iso(currentTo),
            regions: [
              region(1, "North Scotland", 10, "very low"),
              region(7, "South Wales", 350, "very high"),
              region(13, "London", 300, "very high"),
              region(18, "GB", 250, "high"),
            ],
          },
        ],
      },
    };
  }

  if ((m = path.match(/^\/regional\/postcode\/([^/]+)$/))) {
    if (m[1] !== "SW1A") return notFound();
    return {
      status: 200,
      body: {
        data: [
          {
            ...london,
            postcode: "SW1A",
            data: [
              {
                from: iso(currentFrom),
                to: iso(currentTo),
                intensity: { forecast: 300, index: "very high" },
                generationmix: mix,
              },
            ],
          },
        ],
      },
    };
  }

  if ((m = path.match(/^\/regional\/intensity\/([^/]+)\/fw48h\/postcode\/([^/]+)$/))) {
    const [, start = "", outcode = ""] = m;
    if (outcode !== "SW1A") return { status: 200, body: { data: null } };
    const from = new Date(start);
    const periods = halfHours(from, new Date(from.getTime() + 96 * HALF_HOUR)).map((t) => ({
      from: iso(t),
      to: iso(new Date(t.getTime() + HALF_HOUR)),
      intensity: londonValue(t),
      generationmix: mix,
    }));
    return { status: 200, body: { data: { ...london, postcode: "SW1A", data: periods } } };
  }

  return notFound();
}

function notFound() {
  return {
    status: 400,
    body: { error: { code: "400 Bad Request", message: "No postcode match can be found." } },
  };
}

/** Freezes the clock and answers every Carbon Intensity API call with fixtures. */
export async function mockApi(page: Page): Promise<void> {
  await page.clock.setFixedTime(NOW);
  await page.route(`${API}/**`, (route: Route) => {
    const path = new URL(route.request().url()).pathname;
    const { status, body } = respond(path);
    return route.fulfill({
      status,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(body),
    });
  });
}
