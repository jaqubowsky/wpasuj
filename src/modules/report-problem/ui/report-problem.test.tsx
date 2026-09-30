import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { ReportProblem } from "./report-problem";

vi.mock("next/navigation", () => ({ usePathname: () => "/e/Ab3_x-9Qz0" }));

const reportProblem = vi.fn();

vi.mock("../server/report-action", () => ({ reportProblem: (input: unknown) => reportProblem(input) }));

async function openForm() {
  await userEvent.click(screen.getByRole("button", { name: "Zgłoś problem" }));

  return within(await screen.findByRole("dialog", { name: "Zgłoś problem" }));
}

beforeEach(() => {
  reportProblem.mockReset();
});

it("sends what went wrong, the contact and the page it came from", async () => {
  reportProblem.mockResolvedValue({ ok: true });
  render(<ReportProblem />);
  const form = await openForm();

  await userEvent.type(form.getByRole("textbox", { name: "Co nie działa?" }), "Nie mogę zaznaczyć godzin");
  await userEvent.type(form.getByRole("textbox", { name: "Jak się z tobą skontaktować? (opcjonalnie)" }), "ola@example.com");
  await userEvent.click(form.getByRole("button", { name: "Wyślij zgłoszenie" }));

  expect(reportProblem).toHaveBeenCalledWith({
    text: "Nie mogę zaznaczyć godzin",
    contact: "ola@example.com",
    website: "",
    path: "/e/Ab3_x-9Qz0",
    viewport: { width: window.innerWidth, height: window.innerHeight },
  });

  expect(await screen.findByRole("status")).toHaveTextContent("Dzięki, zgłoszenie dotarło.");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("asks for the text instead of sending an empty report", async () => {
  render(<ReportProblem />);
  const form = await openForm();

  await userEvent.click(form.getByRole("button", { name: "Wyślij zgłoszenie" }));

  expect(form.getByRole("textbox", { name: "Co nie działa?" })).toHaveAccessibleDescription("Napisz, co nie działa");
  expect(reportProblem).not.toHaveBeenCalled();
});

it("asks for a shorter text instead of sending one over 2000 characters", async () => {
  render(<ReportProblem />);
  const form = await openForm();

  fireEvent.change(form.getByRole("textbox", { name: "Co nie działa?" }), { target: { value: "a".repeat(2001) } });
  await userEvent.click(form.getByRole("button", { name: "Wyślij zgłoszenie" }));

  expect(form.getByRole("textbox", { name: "Co nie działa?" })).toHaveAccessibleDescription("Najwyżej 2000 znaków, skróć trochę");
  expect(reportProblem).not.toHaveBeenCalled();
});

it.each([
  ["Linear is unavailable", () => reportProblem.mockResolvedValue({ ok: false, reason: "unavailable" })],
  ["the request fails", () => reportProblem.mockRejectedValue(new TypeError("Failed to fetch"))],
])("points to the e-mail address and keeps the text when %s", async (_, breakSending) => {
  breakSending();
  render(<ReportProblem />);
  const form = await openForm();

  await userEvent.type(form.getByRole("textbox", { name: "Co nie działa?" }), "Nie mogę zaznaczyć godzin");
  await userEvent.click(form.getByRole("button", { name: "Wyślij zgłoszenie" }));

  expect(await form.findByRole("alert")).toHaveTextContent("Nie udało się wysłać. Napisz na kontakt@wpasuj.pl.");
  expect(form.getByRole("link", { name: "kontakt@wpasuj.pl" })).toHaveAttribute("href", "mailto:kontakt@wpasuj.pl");
  expect(form.getByRole("textbox", { name: "Co nie działa?" })).toHaveValue("Nie mogę zaznaczyć godzin");
});

it("asks to wait an hour after too many reports", async () => {
  reportProblem.mockResolvedValue({ ok: false, reason: "too-many" });
  render(<ReportProblem />);
  const form = await openForm();

  await userEvent.type(form.getByRole("textbox", { name: "Co nie działa?" }), "Znowu to samo");
  await userEvent.click(form.getByRole("button", { name: "Wyślij zgłoszenie" }));

  expect(await form.findByRole("alert")).toHaveTextContent("Za dużo zgłoszeń naraz. Spróbuj za godzinę albo napisz na kontakt@wpasuj.pl.");
});
