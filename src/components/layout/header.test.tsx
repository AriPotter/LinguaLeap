import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from './header'; // Adjust import path as needed
import { AuthProvider, useAuth } from '@/contexts/auth-context'; // Import context and hook
import type { User } from 'firebase/auth'; // Import User type

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: any }) => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a href={href} {...rest}>{children}</a>;
  };
});

// Mock the useAuth hook
jest.mock('@/contexts/auth-context', () => ({
  // Use actual AuthProvider for structure if needed, but mock useAuth
  ...jest.requireActual('@/contexts/auth-context'), // Keep actual context/provider if needed by components
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

describe('Header Component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockUseAuth.mockClear();
  });

  it('renders the logo and application name linked to the homepage', () => {
    // Mock logged-out state
     mockUseAuth.mockReturnValue({
       user: null,
       loading: false,
       signInWithGoogle: jest.fn(),
       signOut: jest.fn(),
     });
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /LinguaLeap/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
    expect(screen.getByText('LinguaLeap')).toBeInTheDocument();
    expect(logoLink.querySelector('svg')).toBeInTheDocument(); // Check for logo icon
  });

  it('renders the Sign-in button when user is not logged in', () => {
     // Mock logged-out state
     mockUseAuth.mockReturnValue({
       user: null,
       loading: false,
       signInWithGoogle: jest.fn(),
       signOut: jest.fn(),
     });
    render(<Header />);
    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    expect(signInButton).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument(); // Avatar should not be present
  });

  it('calls signInWithGoogle when Sign-in button is clicked', () => {
     const mockSignIn = jest.fn();
     // Mock logged-out state
     mockUseAuth.mockReturnValue({
       user: null,
       loading: false,
       signInWithGoogle: mockSignIn,
       signOut: jest.fn(),
     });
    render(<Header />);
    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    fireEvent.click(signInButton);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('renders user avatar and dropdown when user is logged in', async () => {
     const mockUser: Partial<User> = { // Use Partial<User> for easier mocking
       displayName: 'Test User',
       email: 'test@example.com',
       photoURL: 'https://example.com/avatar.jpg',
     };
     // Mock logged-in state
     mockUseAuth.mockReturnValue({
       user: mockUser,
       loading: false,
       signInWithGoogle: jest.fn(),
       signOut: jest.fn(),
     });

    render(<Header />);

    expect(screen.queryByRole('button', { name: /Sign in/i })).not.toBeInTheDocument();

    // Avatar is usually within a button trigger for the dropdown
    const avatarButton = screen.getByRole('button'); // Find the trigger button
    expect(avatarButton).toBeInTheDocument();
    const avatarImage = screen.getByRole('img'); // Find the image within the avatar
    expect(avatarImage).toHaveAttribute('src', mockUser.photoURL);
    expect(avatarImage).toHaveAttribute('alt', mockUser.displayName);

    // // --- Test Dropdown Interaction ---
    // fireEvent.click(avatarButton); // Open the dropdown

    // await waitFor(() => {
    //   // Elements inside the dropdown should now be visible
    //   expect(screen.getByText(mockUser.displayName!)).toBeInTheDocument();
    //   expect(screen.getByText(mockUser.email!)).toBeInTheDocument();
    //   expect(screen.getByRole('menuitem', { name: /Sign out/i })).toBeInTheDocument();
    // });
  });


  it('displays fallback initials if user has no photoURL', () => {
    const mockUser: Partial<User> = {
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: null, // No photo URL
    };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    render(<Header />);
    const avatarButton = screen.getByRole('button'); // Trigger button
    expect(avatarButton).toBeInTheDocument();
    // Check for fallback content (e.g., initials)
    expect(screen.getByText('T')).toBeInTheDocument(); // Assuming 'T' for 'Test User'
    expect(screen.queryByRole('img')).not.toBeInTheDocument(); // No img tag
  });

   it('displays default icon if user has no photoURL and no displayName', () => {
     const mockUser: Partial<User> = {
       displayName: null,
       email: 'test@example.com',
       photoURL: null,
     };
     mockUseAuth.mockReturnValue({
       user: mockUser,
       loading: false,
       signInWithGoogle: jest.fn(),
       signOut: jest.fn(),
     });

     render(<Header />);
     const avatarButton = screen.getByRole('button');
     expect(avatarButton).toBeInTheDocument();
     // Check for the default UserCircle icon (expects an SVG)
     expect(avatarButton.querySelector('svg')).toBeInTheDocument();
     expect(screen.queryByRole('img')).not.toBeInTheDocument();
   });

  it('calls signOut when Sign out menu item is clicked', async () => {
     const mockSignOut = jest.fn();
     const mockUser: Partial<User> = {
       displayName: 'Test User',
       email: 'test@example.com',
       photoURL: 'https://example.com/avatar.jpg',
     };
     // Mock logged-in state
     mockUseAuth.mockReturnValue({
       user: mockUser,
       loading: false,
       signInWithGoogle: jest.fn(),
       signOut: mockSignOut,
     });

    render(<Header />);
    const avatarButton = screen.getByRole('button'); // Dropdown trigger
    fireEvent.click(avatarButton); // Open dropdown

    // Wait for dropdown items to appear and click sign out
    const signOutMenuItem = await screen.findByRole('menuitem', { name: /Sign out/i });
    fireEvent.click(signOutMenuItem);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('shows loader when loading is true', () => {
     // Mock loading state
     mockUseAuth.mockReturnValue({
       user: null,
       loading: true,
       signInWithGoogle: jest.fn(),
       signOut: jest.fn(),
     });
    render(<Header />);
    // Check for loader icon (expects an SVG with animate-spin class)
    const loader = screen.getByRole('alert', { name: /loading/i }) // Assuming Loader2 adds implicit role or use querySelector
                 ?? document.querySelector('svg.animate-spin');
    expect(loader).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sign in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
