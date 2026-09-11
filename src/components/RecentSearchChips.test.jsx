import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecentSearchChips from "./RecentSearchChips.jsx";

const RECENTS = [
  { name: "Abuja", country: "NG", lat: 9.06, lon: 7.49 },
  { name: "London", country: "GB", lat: 51.51, lon: -0.13 },
];

describe("RecentSearchChips", () => {
  it("renders nothing when there are no recent searches", () => {
    const { container } = render(<RecentSearchChips recents={[]} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders one chip per entry as "City, Country"', () => {
    render(<RecentSearchChips recents={RECENTS} onSelect={() => {}} />);
    expect(screen.getByText("Abuja, NG")).toBeInTheDocument();
    expect(screen.getByText("London, GB")).toBeInTheDocument();
  });

  it("clicking a chip calls onSelect with that entry's city name", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<RecentSearchChips recents={RECENTS} onSelect={onSelect} />);

    await user.click(screen.getByText("London, GB"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("London");
  });
});
