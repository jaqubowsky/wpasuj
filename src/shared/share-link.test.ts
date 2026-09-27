import { afterEach, expect, it, vi } from "vitest";
import { shareOrCopy } from "./share-link";

const message = { text: "Kiedy możecie? Kino https://wpasuj.pl/e/abcdefghij", link: "https://wpasuj.pl/e/abcdefghij" };

function stubBrowser({ share }: { share?: (data: ShareData) => Promise<void> }) {
  const writeText = vi.fn(async () => {});
  vi.stubGlobal("navigator", { share, clipboard: { writeText } });
  return writeText;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

it("opens the share sheet with the whole message", async () => {
  const share = vi.fn(async () => {});
  const writeText = stubBrowser({ share });

  expect(await shareOrCopy(message)).toBe("shared");
  expect(share).toHaveBeenCalledWith({ text: message.text });
  expect(writeText).not.toHaveBeenCalled();
});

it("copies the link where sharing is unavailable", async () => {
  const writeText = stubBrowser({});

  expect(await shareOrCopy(message)).toBe("copied");
  expect(writeText).toHaveBeenCalledWith(message.link);
});

it("copies the link when the browser refuses to share", async () => {
  const writeText = stubBrowser({ share: async () => Promise.reject(new DOMException("no gesture", "NotAllowedError")) });

  expect(await shareOrCopy(message)).toBe("copied");
  expect(writeText).toHaveBeenCalledWith(message.link);
});

it("copies nothing when the person closes the share sheet", async () => {
  const writeText = stubBrowser({ share: async () => Promise.reject(new DOMException("closed", "AbortError")) });

  expect(await shareOrCopy(message)).toBe("cancelled");
  expect(writeText).not.toHaveBeenCalled();
});

it("reports the link as not copied when the clipboard refuses", async () => {
  vi.stubGlobal("navigator", { clipboard: { writeText: async () => Promise.reject(new DOMException("denied", "NotAllowedError")) } });

  expect(await shareOrCopy(message)).toBe("not-copied");
});
