"use client";

import { ErrorPage } from "./error-page";

export default function RouteError({ retry }: { retry: () => void }) {
  return <ErrorPage retry={retry} />;
}
