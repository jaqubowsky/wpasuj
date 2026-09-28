import { beforeEach, expect, it, vi } from "vitest";

const sendBeacon = vi.fn<Navigator["sendBeacon"]>(() => true);

async function freshPage() {
  vi.resetModules();

  return import("./failed-save");
}

beforeEach(() => {
  sendBeacon.mockClear();
  navigator.sendBeacon = sendBeacon;
});

it("reports the action and the error name to the failed-saves route", async () => {
  const { reportFailedSave } = await freshPage();

  reportFailedSave("createPoll")(new TypeError("Failed to fetch"));

  expect(sendBeacon).toHaveBeenCalledExactlyOnceWith("/api/failed-saves", JSON.stringify({ action: "createPoll", errorName: "TypeError" }));
});

it("names an error outside the known list other, so no free text leaves the page", async () => {
  const { reportFailedSave } = await freshPage();

  reportFailedSave("setFinal")(new RangeError("Invalid time zone"));
  reportFailedSave("setFinal")("offline");

  expect(sendBeacon.mock.calls.map(([, body]) => body)).toEqual([
    JSON.stringify({ action: "setFinal", errorName: "other" }),
    JSON.stringify({ action: "setFinal", errorName: "other" }),
  ]);
});

it("sends at most five reports per page load", async () => {
  const { reportFailedSave } = await freshPage();

  for (let attempt = 0; attempt < 7; attempt++) reportFailedSave("saveAnswer")(new TypeError("Failed to fetch"));

  expect(sendBeacon).toHaveBeenCalledTimes(5);
});
