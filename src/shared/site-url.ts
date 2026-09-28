function parseSiteUrl() {
  const url = URL.parse(process.env.SITE_URL ?? "");

  return url?.protocol === "https:" || url?.protocol === "http:" ? url : undefined;
}

export const hasSiteUrl = () => parseSiteUrl() !== undefined;

export function siteUrl() {
  const url = parseSiteUrl();

  if (!url) throw new Error("SITE_URL is not set to an http(s) URL");

  return url;
}
