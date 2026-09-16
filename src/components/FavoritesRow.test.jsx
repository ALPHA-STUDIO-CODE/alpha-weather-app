import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FavoritesRow from "./FavoritesRow.jsx";

const FAVORITES = [
  { name: "Abuja", country: "NG", lat: 9.06, lon: 7.49 },
  { name: "London", country: "GB", lat: 51.51, lon: -0.13 },
];

describe("FavoritesRow", () => {
  it("renders nothing when there are no favorites", () => {
    const { container } = render(<FavoritesRow favorites={[]} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders one entry per favorite as "City, Country"', () => {
    render(<FavoritesRow favorites={FAVORITES} onSelect={() => {}} />);
    expect(screen.getByText("Abuja, NG")).toBeInTheDocument();
    expect(screen.getByText("London, GB")).toBeInTheDocument();
  });

  it("clicking an entry calls onSelect with that entry's city name", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FavoritesRow favorites={FAVORITES} onSelect={onSelect} />);

    await user.click(screen.getByText("London, GB"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("London");
  });
});
