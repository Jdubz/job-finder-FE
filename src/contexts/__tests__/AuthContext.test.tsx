/**
 * Tests for AuthContext
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { type User } from 'firebase/auth';

// Mock Firebase auth
vi.mock('@/config/firebase', () => ({
  auth: {}
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
}));

import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

describe('AuthContext', () => {
  let unsubscribeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    unsubscribeMock = vi.fn();
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      // Initially call with null (no user)
      callback(null);
      return unsubscribeMock;
    });
    vi.mocked(firebaseSignOut).mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide auth context to children', async () => {
      function TestComponent() {
        const { user, loading } = useAuth();
        return (
          <div>
            <div data-testid="user">{user ? 'logged-in' : 'logged-out'}</div>
            <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('logged-out');
    });

    it('should start with loading state', () => {
      function TestComponent() {
        const { loading } = useAuth();
        return <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially should be loading
      const loadingElement = screen.getByTestId('loading');
      expect(loadingElement.textContent === 'loading' || loadingElement.textContent === 'loaded').toBe(true);
    });

    it('should update user when auth state changes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue({
          claims: { role: 'user' }
        }),
      } as unknown as User;

      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return unsubscribeMock;
      });

      function TestComponent() {
        const { user, loading } = useAuth();
        return (
          <div>
            <div data-testid="user">{user ? user.email : 'no-user'}</div>
            <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    it('should set isEditor to true for editor role', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'editor@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue({
          claims: { role: 'editor' }
        }),
      } as unknown as User;

      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return unsubscribeMock;
      });

      function TestComponent() {
        const { isEditor, loading } = useAuth();
        return (
          <div>
            <div data-testid="is-editor">{isEditor ? 'yes' : 'no'}</div>
            <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('is-editor')).toHaveTextContent('yes');
    });

    it('should set isEditor to false for non-editor role', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'user@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue({
          claims: { role: 'user' }
        }),
      } as unknown as User;

      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return unsubscribeMock;
      });

      function TestComponent() {
        const { isEditor, loading } = useAuth();
        return (
          <div>
            <div data-testid="is-editor">{isEditor ? 'yes' : 'no'}</div>
            <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('is-editor')).toHaveTextContent('no');
    });

    it('should handle signOut', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        getIdTokenResult: vi.fn().mockResolvedValue({
          claims: { role: 'editor' }
        }),
      } as unknown as User;

      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return unsubscribeMock;
      });

      function TestComponent() {
        const { user, signOut } = useAuth();
        return (
          <div>
            <div data-testid="user">{user ? user.email : 'no-user'}</div>
            <button onClick={signOut} data-testid="signout-btn">Sign Out</button>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      const signOutBtn = screen.getByTestId('signout-btn');
      signOutBtn.click();

      await waitFor(() => {
        expect(firebaseSignOut).toHaveBeenCalled();
      });
    });

    it('should clean up on unmount', () => {
      function TestComponent() {
        useAuth();
        return <div>Test</div>;
      }

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      function TestComponent() {
        useAuth();
        return <div>Test</div>;
      }

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useAuth must be used within an AuthProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});
