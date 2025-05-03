import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button'; // Adjust the import path as needed

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('handles onClick event', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole('button', { name: /Delete/i });
    expect(buttonElement).toHaveClass('bg-destructive');
  });

  it('applies size classes', () => {
    render(<Button size="lg">Large Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /Large Button/i });
    expect(buttonElement).toHaveClass('h-11'); // Check for lg size class height
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /Disabled Button/i });
    expect(buttonElement).toBeDisabled();
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as child component when asChild is true', () => {
     render(
       <Button asChild>
         <a href="/link">Link Button</a>
       </Button>
     );
     const linkElement = screen.getByRole('link', { name: /Link Button/i });
     expect(linkElement).toBeInTheDocument();
     expect(linkElement).toHaveAttribute('href', '/link');
     // Check if it still applies button styles (example class)
     expect(linkElement).toHaveClass('inline-flex');
   });
});
