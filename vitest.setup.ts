import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
HTMLDialogElement.prototype.close = function () {
  if (!this.open) return;
  this.open = false;
  this.dispatchEvent(new Event("close"));
};
window.matchMedia = (query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  ViewTransition: ({ children }: { children: ReactNode }) => children,
}));

HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
