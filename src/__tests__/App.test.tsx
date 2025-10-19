import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import App from "../App"

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />)
    // Basic smoke test - just ensure the app renders
    expect(document.body).toBeTruthy()
  })

  it("renders router component", () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })
})
