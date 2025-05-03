import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page'; // Adjust the import path as needed

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', {
      name: /Welcome to LinguaLeap!/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the vocabulary card with link', () => {
    render(<Home />);
    expect(screen.getByText('Interactive Vocabulary')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start Learning Vocab/i })).toHaveAttribute('href', '/vocabulary');
  });

  it('renders the quizzes card with link', () => {
    render(<Home />);
    expect(screen.getByText('Adaptive Quizzes')).toBeInTheDocument();
     expect(screen.getByRole('link', { name: /Take a Quiz/i })).toHaveAttribute('href', '/quizzes');
  });

  it('renders the pronunciation card with link', () => {
    render(<Home />);
    expect(screen.getByText('AI Pronunciation Tool')).toBeInTheDocument();
     expect(screen.getByRole('link', { name: /Practice Pronunciation/i })).toHaveAttribute('href', '/pronunciation');
  });
});
