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

  it('renders landing page initially', () => {
    render(<App />);
    expect(screen.getByText(/The Future of/i)).toBeInTheDocument();
  });

  it('opens login modal and allows admin login', async () => {
    render(<App />);
    
    // Click main Login button on landing page
    const loginTrigger = screen.getByText('Login', { selector: 'button' });
    fireEvent.click(loginTrigger);

    // Fill login form
    const usernameInput = screen.getByPlaceholderText(/e.g. admin@estateflow.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /^Login$/ }); // Exact match for button text

    fireEvent.change(usernameInput, { target: { value: 'admin@estateflow.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Total Properties/i)).toBeInTheDocument();
    });
  });

  it('shows error on invalid credentials', async () => {
    render(<App />);
    
    // Open modal
    fireEvent.click(screen.getByText('Login', { selector: 'button' }));

    const usernameInput = screen.getByPlaceholderText(/e.g. admin@estateflow.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /^Login$/ });

    fireEvent.change(usernameInput, { target: { value: 'wrong@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
    });
  });

  it('navigates correctly to Log pages without redirecting to Dashboard', async () => {
    render(<App />);

    // Login first
    fireEvent.click(screen.getByText('Login', { selector: 'button' }));
    const usernameInput = screen.getByPlaceholderText(/e.g. admin@estateflow.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    fireEvent.change(usernameInput, { target: { value: 'admin@estateflow.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /^Login$/ }));

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
});