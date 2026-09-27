import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Cell } from "@/shared/ui/cell/cell";
import { DayHourGrid } from "./day-hour-grid";

const dates = ["2026-10-16", "2026-10-17", "2026-10-18"];
const hours = [17, 18, 19];

function renderGrid(selected: string[] = []) {
  const handlers = { onCellTap: vi.fn(), onDateTap: vi.fn(), onHourTap: vi.fn(), onStroke: vi.fn() };
  render(
    <DayHourGrid
      label="Kiedy możesz?"
      dates={dates}
      hours={hours}
      isSelected={({ date, hour }) => selected.includes(`${date} ${hour}`)}
      renderCell={({ label, tabIndex, preview }) => <Cell state={preview} aria-label={label} tabIndex={tabIndex} />}
      {...handlers}
    />,
  );
  return handlers;
}

describe("DayHourGrid", () => {
  it("is a multiselectable grid with dates as columns and hours as rows", () => {
    renderGrid(["2026-10-17 18"]);

    const grid = screen.getByRole("grid", { name: "Kiedy możesz?" });
    expect(grid).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual(["pt16", "sb17", "nd18"]);
    expect(screen.getAllByRole("rowheader").map((header) => header.textContent)).toEqual(["17:00", "18:00", "19:00"]);
    expect(screen.getAllByRole("gridcell", { selected: true })).toEqual([screen.getByRole("button", { name: "sb 17, 18:00" }).parentElement]);
  });

  it("reads hours past midnight by the clock, after the evening's", () => {
    render(<DayHourGrid label="Kiedy możesz?" dates={dates} hours={[23, 24, 25]} isSelected={() => false} renderCell={({ label }) => <Cell aria-label={label} />} onCellTap={vi.fn()} />);

    expect(screen.getAllByRole("rowheader").map((header) => header.textContent)).toEqual(["23:00", "0:00", "1:00"]);
    expect(screen.getByRole("button", { name: "pt 16, 1:00" })).toBeInTheDocument();
  });

  it("tells each rendered cell whether it is selected", () => {
    const renderCell = vi.fn<(cell: { date: string; selected: boolean }) => null>(() => null);

    render(<DayHourGrid label="Kiedy możesz?" dates={dates} hours={[17]} isSelected={({ date }) => date === "2026-10-17"} renderCell={renderCell} onCellTap={vi.fn()} />);

    expect(renderCell.mock.calls.map(([cell]) => [cell.date, cell.selected])).toEqual([
      ["2026-10-16", false],
      ["2026-10-17", true],
      ["2026-10-18", false],
    ]);
  });

  it("puts each date header over its own column of cells", () => {
    renderGrid();

    const columnOf = (element: HTMLElement) => element.getAttribute("aria-colindex");
    const headerColumns = screen.getAllByRole("columnheader").map(columnOf);
    const [, ...dataRows] = screen.getAllByRole("row");

    expect(headerColumns).toEqual(["2", "3", "4"]);
    for (const row of dataRows) {
      expect(within(row).getByRole("rowheader")).toHaveAttribute("aria-colindex", "1");
      expect(within(row).getAllByRole("gridcell").map(columnOf)).toEqual(headerColumns);
    }
  });

  it("reports a tap on a cell", () => {
    const { onCellTap } = renderGrid();

    fireEvent.click(screen.getByRole("button", { name: "sb 17, 19:00" }));

    expect(onCellTap).toHaveBeenCalledExactlyOnceWith({ date: "2026-10-17", hour: 19 });
  });

  it("reports a tap on a date header and on an hour label", () => {
    const { onDateTap, onHourTap } = renderGrid();

    fireEvent.click(screen.getByRole("button", { name: "nd 18" }));
    fireEvent.click(screen.getByRole("button", { name: "18:00" }));

    expect(onDateTap).toHaveBeenCalledExactlyOnceWith("2026-10-18");
    expect(onHourTap).toHaveBeenCalledExactlyOnceWith(18);
  });

  it("is one tab stop that lands on the first cell", async () => {
    renderGrid();

    await userEvent.tab();

    expect(screen.getByRole("button", { name: "pt 16, 17:00" })).toHaveFocus();
    await userEvent.tab();
    expect(document.body).toHaveFocus();
  });

  it("moves with arrows and toggles with Space", async () => {
    const { onCellTap, onDateTap } = renderGrid();
    await userEvent.tab();

    await userEvent.keyboard("{ArrowRight}{ArrowDown}{ArrowDown}{ArrowDown}");
    await userEvent.keyboard(" ");

    expect(screen.getByRole("button", { name: "sb 17, 19:00" })).toHaveFocus();
    expect(onCellTap).toHaveBeenCalledExactlyOnceWith({ date: "2026-10-17", hour: 19 });

    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}");
    await userEvent.keyboard(" ");

    expect(screen.getByRole("button", { name: "sb 17" })).toHaveFocus();
    expect(onDateTap).toHaveBeenCalledExactlyOnceWith("2026-10-17");
  });

  it("extends the selection with Shift and arrows from where it started", async () => {
    const { onStroke } = renderGrid();
    await userEvent.tab();

    await userEvent.keyboard("{Shift>}{ArrowRight}{ArrowDown}{/Shift}");

    expect(onStroke).toHaveBeenLastCalledWith({ dates: ["2026-10-16", "2026-10-17"], hours: [17, 18], mode: "add" });
    expect(screen.getByRole("button", { name: "sb 17, 18:00" })).toHaveFocus();
  });

  it("starts a new Shift selection from a cell focused some other way", async () => {
    const { onStroke } = renderGrid();
    await userEvent.tab();
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");

    act(() => screen.getByRole("button", { name: "pt 16, 19:00" }).focus());
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");

    expect(onStroke).toHaveBeenLastCalledWith({ dates: ["2026-10-16", "2026-10-17"], hours: [19], mode: "add" });
  });

  describe("to look at, without painting", () => {
    function renderViewOnlyGrid() {
      const onCellTap = vi.fn();
      render(
        <DayHourGrid
          label="Ile osób może"
          dates={dates}
          hours={hours}
          isSelected={({ date, hour }) => date === "2026-10-17" && hour === 18}
          renderCell={({ label, tabIndex }) => <Cell heat={1} aria-label={label} tabIndex={tabIndex}>1</Cell>}
          onCellTap={onCellTap}
        />,
      );
      return { onCellTap };
    }

    it("is a single-select grid whose dates and hours are labels, not buttons", () => {
      renderViewOnlyGrid();

      expect(screen.getByRole("grid", { name: "Ile osób może" })).not.toHaveAttribute("aria-multiselectable");
      expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual(["pt16", "sb17", "nd18"]);
      expect(screen.queryByRole("button", { name: "nd 18" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "18:00" })).not.toBeInTheDocument();
    });

    it("keeps the arrows on the cells and reports Space as a tap", async () => {
      const { onCellTap } = renderViewOnlyGrid();
      await userEvent.tab();

      await userEvent.keyboard("{ArrowUp}{ArrowLeft}{Shift>}{ArrowRight}{/Shift} ");

      expect(screen.getByRole("button", { name: "sb 17, 17:00" })).toHaveFocus();
      expect(onCellTap).toHaveBeenCalledExactlyOnceWith({ date: "2026-10-17", hour: 17 });
    });

  });
});
