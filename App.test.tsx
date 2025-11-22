
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock local storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location.hash
Object.defineProperty(window, 'location', {
  value: { hash: '' },
  writable: true,
});

describe('EstateFlow Application Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    vi.clearAllMocks();
  });

  it('renders login screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. admin@estateflow.com/i)).toBeInTheDocument();
  });

  it('allows admin login and redirects to dashboard', async () => {
    render(<App />);
    
    const usernameInput = screen.getByPlaceholderText(/e.g. admin@estateflow.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(usernameInput, { target: { value: 'admin@estateflow.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Total Properties/i)).toBeInTheDocument();
    });
  });

  it('shows error on invalid credentials', async () => {
    render(<App />);
    
    const usernameInput = screen.getByPlaceholderText(/e.g. admin@estateflow.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(usernameInput, { target: { value: 'wrong@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
    });
  });

  it('navigates correctly to Log pages without redirecting to Dashboard', async () => {
    render(<App />);

    // Login first
    const usernameInput = screen.getByPlaceholderText(/e.g. admin@estateflow.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    fireEvent.change(usernameInput, { target: { value: 'admin@estateflow.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => expect(screen.getByText(/Total Properties/i)).toBeInTheDocument());

    // Click Audit Log
    const auditLogLink = screen.getByText(/Audit Log/i);
    fireEvent.click(auditLogLink);

    await waitFor(() => {
      expect(screen.getByText(/Audit Log/i)).toBeInTheDocument();
      // Should NOT see dashboard widgets
      expect(screen.queryByText(/Total Properties/i)).not.toBeInTheDocument();
    });

     // Click Email Log
     const emailLogLink = screen.getByText(/Email Log/i);
     fireEvent.click(emailLogLink);
 
     await waitFor(() => {
       expect(screen.getByText(/Automated Email Log/i)).toBeInTheDocument();
     });
  });

  it('restricts access based on roles', async () => {
     // Mock a restricted user (e.g., Agent who shouldn't see Users page)
     // Note: In the real app, the sidebar link wouldn't even render, 
     // but we can test if manually setting hash redirects to Access Denied.
     
     render(<App />);
     // Login as Agent
     const usernameInput = screen.getByPlaceholderText(/e.g. admin@estateflow.com/i);
     const passwordInput = screen.getByPlaceholderText(/••••••••/i);
     fireEvent.change(usernameInput, { target: { value: 'agent@estateflow.com' } });
     fireEvent.change(passwordInput, { target: { value: 'agent123' } });
     fireEvent.click(screen.getByRole('button', { name: /Login/i }));

     await waitFor(() => expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()); // Dashboard

     // Attempt to navigate to Users page (manually via hash)
     window.location.hash = '#users';
     fireEvent(window, new Event('hashchange'));

     await waitFor(() => {
         expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
     });
  });
});
