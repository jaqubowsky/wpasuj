import { describe, expect, it } from "vitest";
import { analyticsConfiguration } from "./analytics";

const scriptUrl = "https://analytics.example/script.js";
const website = "c98aed47-de54-4577-bde2-8f1133b5c5d5";

describe("analytics configuration", () => {
  it("accepts the approved LinkedIn launch with the two public values", () => {
    expect(analyticsConfiguration(scriptUrl, website, undefined)).toEqual({
      scriptUrl,
      website,
      attribution: { utm_source: ["linkedin"], utm_medium: ["social"], utm_campaign: ["launch"] },
    });
  });

  it("accepts approved campaign labels and source hosts", () => {
    const attribution = { utm_source: ["newsletter"], utm_campaign: ["launch"], referrerHosts: ["google.com"] };

    expect(analyticsConfiguration(scriptUrl, website, JSON.stringify(attribution))).toEqual({
      scriptUrl,
      website,
      attribution: { ...attribution, utm_medium: ["social"] },
    });
  });

  it.each([
    [undefined, website, undefined],
    [scriptUrl, undefined, undefined],
    [scriptUrl, "not-a-uuid", undefined],
    ["http://analytics.example/script.js", website, undefined],
    ["https://user:secret@analytics.example/script.js", website, undefined],
    ["https://analytics.example/script.js?token=secret", website, undefined],
    [scriptUrl, website, "{invalid"],
    [scriptUrl, website, '{"utm_source":["https://secret.example"]}'],
    [scriptUrl, website, '{"token":["secret"]}'],
  ])("disables incomplete or invalid configuration %#", (script, id, attribution) => {
    expect(analyticsConfiguration(script, id, attribution)).toBeUndefined();
  });
});
