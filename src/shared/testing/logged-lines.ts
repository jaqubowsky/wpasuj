import { vi } from "vitest";

export function loggedLines(stream: "log" | "error") {
  const write = vi.spyOn(console, stream).mockImplementation(() => {});

  return () => write.mock.calls.map((args) => args.join(" "));
}
