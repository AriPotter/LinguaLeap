import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './header'; // Adjust import path as needed

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: any }) => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a href={href} {...rest}>{children}</a>;
  };
});


describe('Header Component', () => {
  it('renders the logo and application name linked to the homepage', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /LinguaLeap/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
    expect(screen.getByText('LinguaLeap')).toBeInTheDocument();
    // Check for icon presence - Lucide icons don't have default test IDs or accessible names
    // We can check if an SVG is rendered within the link
    expect(logoLink.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the Sign-in button', () => {
    render(<Header />);
    const signInButton = screen.getByRole('button', { name: /Sign-in/i });
    expect(signInButton).toBeInTheDocument();
  });
});
