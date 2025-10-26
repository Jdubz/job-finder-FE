import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { HealthMetricsGrid } from "../components/HealthMetricsGrid"

describe("HealthMetricsGrid", () => {
  const mockMetrics = {
    cpuUsage: 45.5,
    memoryUsage: 62.3,
    diskUsage: 78.9,
    responseTime: 125,
    requestCount: 1234,
    errorRate: 0.5,
    uptime: 86400, // 1 day in seconds
    lastUpdated: new Date("2025-01-01T10:00:00Z"),
  }

  it("should render all metrics", () => {
    render(<HealthMetricsGrid metrics={mockMetrics} />)

    expect(screen.getByText(/CPU Usage/i)).toBeInTheDocument()
    expect(screen.getByText(/Memory Usage/i)).toBeInTheDocument()
    expect(screen.getByText(/Disk Usage/i)).toBeInTheDocument()
    expect(screen.getByText(/Response Time/i)).toBeInTheDocument()
  })

  it("should display CPU usage percentage", () => {
    render(<HealthMetricsGrid metrics={mockMetrics} />)

    expect(screen.getByText("45.5%")).toBeInTheDocument()
  })

  it("should display memory usage percentage", () => {
    render(<HealthMetricsGrid metrics={mockMetrics} />)

    expect(screen.getByText("62.3%")).toBeInTheDocument()
  })

  it("should display disk usage percentage", () => {
    render(<HealthMetricsGrid metrics={mockMetrics} />)

    expect(screen.getByText("78.9%")).toBeInTheDocument()
  })

  it("should display response time in ms", () => {
    render(<HealthMetricsGrid metrics={mockMetrics} />)

    expect(screen.getByText(/125ms/i)).toBeInTheDocument()
  })

  it("should display request count", () => {
    render(<HealthMetricsGrid metrics={mockMetrics} />)

    expect(screen.getByText("1234")).toBeInTheDocument()
  })

  it("should display error rate percentage", () => {
    render(<HealthMetricsGrid metrics={mockMetrics} />)

    expect(screen.getByText("0.5%")).toBeInTheDocument()
  })

  it("should show warning color for high CPU usage", () => {
    const highCPU = { ...mockMetrics, cpuUsage: 85 }
    const { container } = render(<HealthMetricsGrid metrics={highCPU} />)

    const cpuCard = container.querySelector('[data-metric="cpu"]')
    expect(cpuCard).toHaveClass("border-yellow-500")
  })

  it("should show danger color for critical disk usage", () => {
    const criticalDisk = { ...mockMetrics, diskUsage: 95 }
    const { container } = render(<HealthMetricsGrid metrics={criticalDisk} />)

    const diskCard = container.querySelector('[data-metric="disk"]')
    expect(diskCard).toHaveClass("border-red-500")
  })

  it("should show success color for normal metrics", () => {
    const normalMetrics = {
      ...mockMetrics,
      cpuUsage: 30,
      memoryUsage: 40,
      diskUsage: 50,
    }
    const { container } = render(<HealthMetricsGrid metrics={normalMetrics} />)

    const cpuCard = container.querySelector('[data-metric="cpu"]')
    expect(cpuCard).toHaveClass("border-green-500")
  })

  it("should format uptime correctly", () => {
    render(<HealthMetricsGrid metrics={mockMetrics} />)

    expect(screen.getByText(/1d/i)).toBeInTheDocument()
  })

  it("should display last updated timestamp", () => {
    render(<HealthMetricsGrid metrics={mockMetrics} />)

    expect(screen.getByText(/Last updated/i)).toBeInTheDocument()
  })

  it("should handle zero values", () => {
    const zeroMetrics = {
      ...mockMetrics,
      cpuUsage: 0,
      memoryUsage: 0,
      errorRate: 0,
    }

    render(<HealthMetricsGrid metrics={zeroMetrics} />)

    expect(screen.getByText("0%")).toBeInTheDocument()
  })

  it("should render with grid layout", () => {
    const { container } = render(<HealthMetricsGrid metrics={mockMetrics} />)

    const grid = container.querySelector(".grid")
    expect(grid).toBeInTheDocument()
  })

  it("should handle missing metrics gracefully", () => {
    const partialMetrics = {
      cpuUsage: 45,
      memoryUsage: 60,
    }

    render(<HealthMetricsGrid metrics={partialMetrics as any} />)

    expect(screen.getByText(/CPU Usage/i)).toBeInTheDocument()
  })
})
