import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CardSkeleton } from "../src/components/CardSkeleton";
import { ErrorCard } from "../src/components/ErrorCard";

describe("CardSkeleton", () => {
  it("announces what is loading", () => {
    render(<CardSkeleton label="Loading the forecast" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading the forecast…");
  });
});

describe("ErrorCard", () => {
  it("shows the message and retries on click", async () => {
    const onRetry = vi.fn();
    render(<ErrorCard message="Could not load." onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Could not load.");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("hides Retry when there's nothing to retry", () => {
    render(<ErrorCard message="Could not load." />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
