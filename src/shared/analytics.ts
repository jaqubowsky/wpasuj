import { z } from "zod";

const label = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/);

const configurationSchema = z.object({
  scriptUrl: z.url().refine((value) => {
    const url = new URL(value);

    return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash;
  }),
  website: z.uuid(),
  attribution: z
    .object({
      utm_source: z.array(label).optional(),
      utm_medium: z.array(label).optional(),
      utm_campaign: z.array(label).optional(),
      utm_content: z.array(label).optional(),
      utm_term: z.array(label).optional(),
      referrerHosts: z.array(z.hostname()).optional(),
    })
    .strict(),
});

export function analyticsConfiguration(scriptUrl: string | undefined, website: string | undefined, attribution: string | undefined) {
  try {
    const parsed = configurationSchema.safeParse({
      scriptUrl,
      website,
      attribution: {
        utm_source: ["linkedin"],
        utm_medium: ["social"],
        utm_campaign: ["launch"],
        ...JSON.parse(attribution || "{}"),
      },
    });

    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

export const analytics = analyticsConfiguration(
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  process.env.NEXT_PUBLIC_UMAMI_ATTRIBUTION,
);

export type AnalyticsEvent =
  | "create_started"
  | "create_submitted"
  | "create_validation_failed"
  | "poll_created"
  | "invite_share_clicked"
  | "invite_copied"
  | "poll_entered"
  | "availability_started"
  | "answer_first_saved"
  | "answer_changed_saved"
  | "answer_save_failed"
  | "results_opened"
  | "time_set"
  | "calendar_clicked"
  | "settled_share_clicked"
  | "own_poll_clicked";
export type AnalyticsPayload = { website: string; url: string; referrer?: string; name?: AnalyticsEvent; data?: Record<string, string> };

declare global {
  interface Window {
    umami?: { track: (payload: AnalyticsPayload) => Promise<void> };
  }
}

const oncePerVisit = new Set<AnalyticsEvent>(["create_started", "availability_started", "poll_entered"]);
const observed = new Set<AnalyticsEvent>();
let visitPath: string | undefined;

export function beginAnalyticsVisit(pathname?: string) {
  if (pathname !== undefined && visitPath === pathname) return false;

  visitPath = pathname;
  observed.clear();

  return true;
}

export function approvedAttribution(search: string) {
  const input = new URLSearchParams(search);
  const approved: Record<string, string> = {};

  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const) {
    const value = input.get(key);

    if (value && analytics?.attribution[key]?.includes(value)) approved[key] = value;
  }

  return approved;
}

export function trackAnalyticsEvent(name: AnalyticsEvent, url: "/" | "/e/[id]" = "/") {
  if (!analytics) return;
  if (oncePerVisit.has(name) && observed.has(name)) return;

  try {
    if (new URL(analytics.scriptUrl).origin === window.location.origin) return;

    observed.add(name);
    const data = url === "/" && window.location.pathname === "/" ? approvedAttribution(window.location.search) : {};

    void window.umami
      ?.track({ website: analytics.website, url, name, ...(Object.keys(data).length ? { data } : {}) })
      .catch(() => undefined);
  } catch {
    return;
  }
}
