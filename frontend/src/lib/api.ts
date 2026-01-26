import { apiClient } from './api-client';

export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string | null;
  profile_image: string | null;
  is_admin?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface UploadResponse {
  message: string;
  profile_image: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  bio?: string;
}

// Auth API
export const authApi = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: User }> => {
    return apiClient.request<{ user: User }>('/auth/me');
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('profile_image', file);
    
    return apiClient.upload<UploadResponse>('/auth/upload-profile-image', formData);
  },

  // Delete profile image
  deleteProfileImage: async (): Promise<{ message: string }> => {
    return apiClient.request<{ message: string }>('/auth/delete-profile-image', {
      method: 'DELETE',
    });
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: User }> => {
    return apiClient.request<{ message: string; user: User }>('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get profile image URL
  getProfileImageUrl: (filename: string | null): string | null => {
    if (!filename) return null;
    // Remove '/api' from the base URL since /uploads is served at root level
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/uploads/profiles/${filename}`;
  },
};

// Admin API
export const adminApi = {
  // Get all users
  getAllUsers: async (): Promise<{ users: User[] }> => {
    return apiClient.request<{ users: User[] }>('/auth/admin/users');
  },

  // Create user
  createUser: async (data: {
    username: string;
    email: string;
    password: string;
    is_admin?: boolean;
  }): Promise<{ message: string; user: User }> => {
    return apiClient.request<{ message: string; user: User }>('/auth/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete user
  deleteUser: async (userId: number): Promise<{ message: string }> => {
    return apiClient.request<{ message: string }>(`/auth/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Update admin status
  updateAdminStatus: async (userId: number, isAdmin: boolean): Promise<{ message: string; user: User }> => {
    return apiClient.request<{ message: string; user: User }>(`/auth/admin/users/${userId}/admin-status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_admin: isAdmin }),
    });
  },
};
