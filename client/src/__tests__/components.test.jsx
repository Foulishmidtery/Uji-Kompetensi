import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock the auth context
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', role: 'admin', email: 'test@test.com' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock the theme context
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    mode: 'dark',
    setMode: vi.fn()
  }),
  ThemeProvider: ({ children }) => children,
}));

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import ProtectedRoute from '../components/ProtectedRoute';

describe('Sidebar Component', () => {
  it('renders the app logo', () => {
    render(<BrowserRouter><Sidebar /></BrowserRouter>);
    expect(screen.getByText('InvenTrack')).toBeInTheDocument();
  });

  it('shows admin navigation items', () => {
    render(<BrowserRouter><Sidebar /></BrowserRouter>);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Inventaris')).toBeInTheDocument();
    expect(screen.getByText('Peminjaman')).toBeInTheDocument();
    expect(screen.getByText('Laporan')).toBeInTheDocument();
    expect(screen.getByText('Log Aktivitas')).toBeInTheDocument();
    expect(screen.getByText('Kelola User')).toBeInTheDocument();
  });

  it('displays user name', () => {
    render(<BrowserRouter><Sidebar /></BrowserRouter>);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});

describe('Navbar Component', () => {
  it('renders the page title', () => {
    render(<Navbar title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays user greeting', () => {
    render(<Navbar title="Test" />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});

describe('Modal Component', () => {
  it('renders when open', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Test Modal"><p>Modal Content</p></Modal>);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal isOpen={false} onClose={() => {}} title="Hidden"><p>Hidden Content</p></Modal>);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });
});

describe('ProtectedRoute Component', () => {
  it('renders children for authenticated users', () => {
    render(<BrowserRouter><ProtectedRoute><p>Protected Content</p></ProtectedRoute></BrowserRouter>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user has correct role', () => {
    render(<BrowserRouter><ProtectedRoute roles={['admin']}><p>Admin Content</p></ProtectedRoute></BrowserRouter>);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
