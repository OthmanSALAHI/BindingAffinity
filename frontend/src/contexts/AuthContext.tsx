import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated on mount
    const initAuth = async () => {
      console.log('🔐 AuthContext: Starting auth initialization...');
      try {
        // First check if token exists in localStorage
        const hasToken = authApi.isAuthenticated();
        console.log('🔐 AuthContext: Has token?', hasToken);
        
        if (!hasToken) {
          console.log('🔐 AuthContext: No token found, user not authenticated');
          setIsLoading(false);
          return;
        }

        // Token exists, try to fetch current user
        console.log('🔐 AuthContext: Token found, fetching current user...');
        const { user: currentUser } = await authApi.getCurrentUser();
        console.log('🔐 AuthContext: User fetched successfully', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('🔐 AuthContext: Auth init error:', error);
        // Clear invalid token
        authApi.logout();
        setUser(null);
      } finally {
        console.log('🔐 AuthContext: Auth initialization complete, isLoading = false');
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ username, email, password });
      setUser(response.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: !!user?.is_admin,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
