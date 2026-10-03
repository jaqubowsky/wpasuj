import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import MeetingGuidePage, { generateMetadata } from "./page";

vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("./create.png", () => ({ default: { src: "/_next/static/media/create.png", width: 780, height: 1688 } }));
vi.mock("./answer.png", () => ({ default: { src: "/_next/static/media/answer.png", width: 780, height: 1688 } }));
vi.mock("./results.png", () => ({ default: { src: "/_next/static/media/results.png", width: 780, height: 1688 } }));

afterEach(() => vi.unstubAllEnvs());

it("names the guide and its canonical on the current site", async () => {
  vi.stubEnv("SITE_URL", "https://guide.example");

  const metadata = await generateMetadata();

  expect(metadata.metadataBase).toEqual(new URL("https://guide.example/"));
  expect(metadata.title).toBe("Jak ustalić termin spotkania ze znajomymi · Wpasuj");
  expect(metadata.description).toMatch(/^Czat, jedna propozycja czy ankieta/);
  expect(metadata.alternates?.canonical).toBe("/jak-ustalic-termin");
});

it("shows the guide, screenshots and matching instructions for search engines", async () => {
  vi.stubEnv("SITE_URL", "https://guide.example");

  const { container } = render(await MeetingGuidePage());
  const [article, howTo] = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Jak ustalić termin spotkania ze znajomymi");
  expect(screen.getAllByRole("img")).toHaveLength(3);
  expect(screen.getByRole("link", { name: "Utwórz ankietę" })).toHaveAttribute("href", "/#utworz");
  expect(article).toMatchObject({ "@type": "Article", url: "https://guide.example/jak-ustalic-termin" });
  expect(howTo["@type"]).toBe("HowTo");
  expect(howTo.step).toHaveLength(5);

  for (const step of howTo.step) {
    expect(screen.getByRole("heading", { name: step.name })).toBeInTheDocument();
    expect(screen.getByText(step.text)).toBeInTheDocument();
    expect(step.url).toMatch(/^https:\/\/guide.example\/jak-ustalic-termin#/);
  }
});
