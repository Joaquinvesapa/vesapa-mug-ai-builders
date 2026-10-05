import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("test tooling", () => {
  it("renders a React component with Testing Library", () => {
    render(<h1>Festival Social Grid</h1>);

    expect(
      screen.getByRole("heading", { name: "Festival Social Grid" }),
    ).toBeInTheDocument();
  });
});
