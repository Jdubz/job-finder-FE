import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { MainLayout } from '../MainLayout'
import { vi } from 'vitest'

// Mock the child components
vi.mock('../Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation Component</div>
}))

vi.mock('../Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>
}))

describe('MainLayout', () => {
  it('renders all layout components', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument()
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('has proper flexbox structure', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    )
    
    const container = screen.getByTestId('navigation').closest('div')
    expect(container).toHaveClass('min-h-screen', 'bg-background', 'flex', 'flex-col')
  })

  it('has proper main content styling', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    )
    
    const main = screen.getByTestId('outlet').closest('main')
    expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-8', 'flex-1')
  })

  it('renders navigation at the top', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    )
    
    const container = screen.getByTestId('navigation').closest('div')
    const children = Array.from(container?.children || [])
    
    expect(children[0]).toHaveAttribute('data-testid', 'navigation')
  })

  it('renders footer at the bottom', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    )
    
    const container = screen.getByTestId('footer').closest('div')
    const children = Array.from(container?.children || [])
    
    expect(children[children.length - 1]).toHaveAttribute('data-testid', 'footer')
  })

  it('renders outlet between navigation and footer', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    )
    
    const container = screen.getByTestId('outlet').closest('div')
    const children = Array.from(container?.children || [])
    
    const navigationIndex = children.findIndex(child => 
      child.getAttribute('data-testid') === 'navigation'
    )
    const outletIndex = children.findIndex(child => 
      child.getAttribute('data-testid') === 'outlet'
    )
    const footerIndex = children.findIndex(child => 
      child.getAttribute('data-testid') === 'footer'
    )
    
    expect(navigationIndex).toBeLessThan(outletIndex)
    expect(outletIndex).toBeLessThan(footerIndex)
  })

  it('has proper background styling', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    )
    
    const container = screen.getByTestId('navigation').closest('div')
    expect(container).toHaveClass('bg-background')
  })

  it('has minimum height styling', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    )
    
    const container = screen.getByTestId('navigation').closest('div')
    expect(container).toHaveClass('min-h-screen')
  })
})