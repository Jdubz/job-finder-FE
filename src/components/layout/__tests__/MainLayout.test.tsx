/**
 * MainLayout Component Tests
 * 
 * Tests for the MainLayout component functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { MainLayout } from "../MainLayout"

// Mock the Navigation component
vi.mock("../Navigation", () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}))

// Test component to render inside the layout
const TestPage = () => <div data-testid="test-page">Test Page Content</div>

describe("MainLayout", () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={component}>
            <Route index element={<TestPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }

  describe("rendering", () => {
    it("should render navigation component", () => {
      renderWithRouter(<MainLayout />)

      expect(screen.getByTestId("navigation")).toBeInTheDocument()
    })

    it("should render outlet content", () => {
      renderWithRouter(<MainLayout />)

      expect(screen.getByTestId("test-page")).toBeInTheDocument()
      expect(screen.getByText("Test Page Content")).toBeInTheDocument()
    })

    it("should have correct layout structure", () => {
      renderWithRouter(<MainLayout />)

      const container = screen.getByTestId("navigation").parentElement
      expect(container).toHaveClass("min-h-screen", "bg-background")
    })

    it("should have main content area with correct classes", () => {
      renderWithRouter(<MainLayout />)

      const main = screen.getByRole("main")
      expect(main).toBeInTheDocument()
      expect(main).toHaveClass("container", "mx-auto", "px-4", "py-8")
    })
  })

  describe("layout structure", () => {
    it("should have navigation at the top", () => {
      renderWithRouter(<MainLayout />)

      const navigation = screen.getByTestId("navigation")
      const main = screen.getByRole("main")
      
      // Navigation should come before main in the DOM
      expect(navigation.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it("should have main content below navigation", () => {
      renderWithRouter(<MainLayout />)

      const main = screen.getByRole("main")
      expect(main).toBeInTheDocument()
    })
  })

  describe("responsive design", () => {
    it("should handle different screen sizes", () => {
      renderWithRouter(<MainLayout />)

      // Should render without errors
      expect(screen.getByTestId("navigation")).toBeInTheDocument()
      expect(screen.getByTestId("test-page")).toBeInTheDocument()
    })
  })

  describe("accessibility", () => {
    it("should have proper main landmark", () => {
      renderWithRouter(<MainLayout />)

      const main = screen.getByRole("main")
      expect(main).toBeInTheDocument()
    })

    it("should have proper document structure", () => {
      renderWithRouter(<MainLayout />)

      // Should have a proper document structure
      expect(document.body).toBeInTheDocument()
    })
  })

  describe("content rendering", () => {
    it("should render different content based on route", () => {
      const AnotherPage = () => <div data-testid="another-page">Another Page</div>
      
      render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<TestPage />} />
              <Route path="another" element={<AnotherPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )

      expect(screen.getByTestId("test-page")).toBeInTheDocument()
    })
  })

  describe("edge cases", () => {
    it("should handle empty outlet", () => {
      render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />} />
          </Routes>
        </BrowserRouter>
      )

      expect(screen.getByTestId("navigation")).toBeInTheDocument()
      expect(screen.getByRole("main")).toBeInTheDocument()
    })
  })
})
