export const renderErrorNames = ["Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "other"] as const;
export const renderedRoutes = ["/", "/e/[id]", "other"] as const;

type RenderErrorName = (typeof renderErrorNames)[number];

const isReportedName = (name: string): name is RenderErrorName => renderErrorNames.includes(name as RenderErrorName);

const routeOf = (pathname: string) => {
  if (pathname === "/") return "/";

  return /^\/e\/[^/]+$/.test(pathname) ? "/e/[id]" : "other";
};

export function reportRenderError(error: unknown) {
  const errorName = error instanceof Error && isReportedName(error.name) ? error.name : "other";
  const hasDigest = error instanceof Error && "digest" in error;

  navigator.sendBeacon("/api/render-errors", JSON.stringify({ errorName, hasDigest, route: routeOf(location.pathname) }));
}
