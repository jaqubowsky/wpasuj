import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("shows the capital initial and names the person", () => {
    render(<Avatar name="łucja" tintKey="łucja" />);

    expect(screen.getByRole("img", { name: "łucja" })).toHaveTextContent("Ł");
  });

  it("keeps a person's tint through a case-only rename", () => {
    render(
      <>
        <Avatar name="Ola" tintKey="ola" />
        <Avatar name="ola" tintKey="ola" />
      </>,
    );

    const [first, second] = screen.getAllByRole("img");

    expect(first.dataset.tint).toBe(second.dataset.tint);
  });

  it("spreads names over all five tints", () => {
    const names = ["Kuba", "Ola", "Michał", "Zosia", "Bartek", "Ania", "Tomek", "Ewa", "Piotr", "Kasia", "Jan", "Ula"];

    render(names.map((name) => <Avatar key={name} name={name} tintKey={name.toLocaleLowerCase("pl")} />));

    const tints = new Set(screen.getAllByRole("img").map((avatar) => avatar.dataset.tint));

    expect(tints).toEqual(new Set(["coral", "lilac", "mint", "butter", "sky"]));
  });

  it("pops in when asked", () => {
    render(<Avatar name="Bartek" tintKey="bartek" pop />);

    expect(screen.getByRole("img", { name: "Bartek" })).toHaveAttribute("data-pop");
  });

  it("carries the organiser's crown, the cross of someone who cannot and the ring around you", () => {
    render(
      <>
        <Avatar name="Kuba" tintKey="kuba" mark="organiser" you />
        <Avatar name="Bartek" tintKey="bartek" mark="cannot" />
      </>,
    );

    const kuba = screen.getByRole("img", { name: "Kuba" });
    const bartek = screen.getByRole("img", { name: "Bartek" });

    expect(kuba).toHaveAttribute("data-mark", "organiser");
    expect(kuba).toHaveAttribute("data-you");
    expect(bartek).toHaveAttribute("data-mark", "cannot");
    expect(bartek).not.toHaveAttribute("data-tint");
  });
});
