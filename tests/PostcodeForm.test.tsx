import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PostcodeForm } from "../src/components/PostcodeForm";

describe("PostcodeForm", () => {
  it("submits the outward half of a full postcode", async () => {
    const onSubmit = vi.fn();
    render(<PostcodeForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("Your postcode"), "sw1a 1aa");
    await userEvent.click(screen.getByRole("button", { name: "Show my area" }));

    expect(onSubmit).toHaveBeenCalledWith("SW1A");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("explains what's wrong with an invalid postcode", async () => {
    const onSubmit = vi.fn();
    render(<PostcodeForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("Your postcode"), "hello{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/Enter a UK postcode/);
    expect(screen.getByLabelText("Your postcode")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
