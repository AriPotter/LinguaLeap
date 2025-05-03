import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VocabularyPage from './page'; // Adjust import path

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock alert used for audio playback simulation
global.alert = jest.fn();

describe('VocabularyPage', () => {
  beforeEach(() => {
     // Reset mocks before each test
     (global.alert as jest.Mock).mockClear();
  });

  it('renders the first vocabulary item initially', () => {
    render(<VocabularyPage />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Manzana')).toBeInTheDocument();
    expect(screen.getByAltText('Apple')).toHaveAttribute('src', 'https://picsum.photos/300/200?random=1');
  });

  it('navigates to the next item when "Next" button is clicked', () => {
    render(<VocabularyPage />);
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    expect(screen.getByText('Book')).toBeInTheDocument();
    expect(screen.getByText('Libro')).toBeInTheDocument();
    expect(screen.getByAltText('Book')).toHaveAttribute('src', 'https://picsum.photos/300/200?random=2');
  });

   it('navigates to the previous item when "Previous" button is clicked', () => {
    render(<VocabularyPage />);
    // Go next first
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('Book')).toBeInTheDocument(); // Verify we are on the second item

    // Go previous
    fireEvent.click(screen.getByRole('button', { name: /Previous/i }));

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Manzana')).toBeInTheDocument();
     expect(screen.getByAltText('Apple')).toHaveAttribute('src', 'https://picsum.photos/300/200?random=1');
   });

   it('wraps around to the first item after the last item when "Next" is clicked', () => {
     render(<VocabularyPage />);
     // Click next 5 times to reach the end and wrap around
     for (let i = 0; i < 5; i++) {
       fireEvent.click(screen.getByRole('button', { name: /Next/i }));
     }

     expect(screen.getByText('Apple')).toBeInTheDocument(); // Should be back at the first item
   });

   it('wraps around to the last item from the first item when "Previous" is clicked', () => {
     render(<VocabularyPage />);
     fireEvent.click(screen.getByRole('button', { name: /Previous/i }));

     expect(screen.getByText('Car')).toBeInTheDocument(); // Should be at the last item
     expect(screen.getByText('Coche')).toBeInTheDocument();
     expect(screen.getByAltText('Car')).toHaveAttribute('src', 'https://picsum.photos/300/200?random=5');
   });

   it('calls the playAudio simulation when the volume button is clicked', () => {
     render(<VocabularyPage />);
     fireEvent.click(screen.getByRole('button', { name: /Pronounce Apple/i }));
     expect(global.alert).toHaveBeenCalledWith('(Audio playback simulation for "Apple")');
   });
});
