"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  analytics as configuration,
  approvedAttribution,
  beginAnalyticsVisit,
  trackAnalyticsEvent,
  type AnalyticsPayload,
} from "@/shared/analytics";

const publicPaths = new Set(["/", "/regulamin", "/polityka-prywatnosci", "/jak-ustalic-termin"]);
let pageviewSent = false;

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (beginAnalyticsVisit(pathname)) pageviewSent = false;

    const pollEntry = /^\/e\/[^/]+$/.test(pathname);

    if (!configuration || (!publicPaths.has(pathname) && !pollEntry) || new URL(configuration.scriptUrl).origin === window.location.origin)
      return;

    const query = new URLSearchParams(approvedAttribution(window.location.search));
    const payload: AnalyticsPayload = { website: configuration.website, url: pathname + (query.size ? `?${query}` : "") };

    if (!pollEntry && document.referrer) {
      const referrer = new URL(document.referrer);

      if (referrer.origin !== window.location.origin && configuration.attribution.referrerHosts?.includes(referrer.hostname)) {
        payload.referrer = `https://${referrer.hostname}/`;
      }
    }

    const track = () => {
      if (pollEntry) return trackAnalyticsEvent("poll_entered", "/e/[id]");
      if (pageviewSent) return;

      pageviewSent = true;

      try {
        void window.umami?.track(payload).catch(() => undefined);
      } catch {
        return;
      }
    };

    const invitationClick = (event: MouseEvent) => {
      if (pollEntry && event.target instanceof Element && event.target.closest("[data-answer-invite] a, [data-poll-footer-invite] a")) {
        trackAnalyticsEvent("own_poll_clicked", "/e/[id]");
      }
    };

    document.addEventListener("click", invitationClick);
    let script: HTMLScriptElement | undefined;

    if (window.umami) track();
    else {
      script = document.createElement("script");
      script.src = configuration.scriptUrl;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.dataset.websiteId = configuration.website;
      script.dataset.autoTrack = "false";
      script.dataset.doNotTrack = "true";
      script.onload = track;
      document.head.append(script);
    }

    return () => {
      document.removeEventListener("click", invitationClick);

      if (script) {
        script.onload = null;
        script.remove();
      }
    };
  }, [pathname]);

  return null;
}
