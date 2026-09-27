import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("shows the capital initial and names the person", () => {
    render(<Avatar name="łucja" />);

    expect(screen.getByRole("img", { name: "łucja" })).toHaveTextContent("Ł");
  });

  it("gives a person the same tint every time", () => {
    render(
      <>
        <Avatar name="Ola" />
        <Avatar name="Ola" />
      </>,
    );

    const [first, second] = screen.getAllByRole("img");
    expect(first.dataset.tint).toBe(second.dataset.tint);
  });

  it("spreads names over all five tints", () => {
    const names = ["Kuba", "Ola", "Michał", "Zosia", "Bartek", "Ania", "Tomek", "Ewa", "Piotr", "Kasia", "Jan", "Ula"];
    render(names.map((name) => <Avatar key={name} name={name} />));

    const tints = new Set(screen.getAllByRole("img").map((avatar) => avatar.dataset.tint));
    expect(tints).toEqual(new Set(["coral", "lilac", "mint", "butter", "sky"]));
  });

  it("pops in when asked", () => {
    render(<Avatar name="Bartek" pop />);

    expect(screen.getByRole("img", { name: "Bartek" })).toHaveAttribute("data-pop");
  });
});
