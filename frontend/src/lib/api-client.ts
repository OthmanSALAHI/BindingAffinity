const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// The separate URL for the AI Model
const BINDING_AFFINITY_API = 'https://abdoir-drug-target-binding-affinity.hf.space';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Helper to get JWT for your Express Backend
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method (Uses API_BASE_URL by default)
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${cleanEndpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(), // Auto-adds token
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Network error');
    }
  }

  // Upload method (Uses API_BASE_URL)
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('token');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${cleanEndpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Upload failed');
      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Upload error');
    }
  }

  // --- PREDICTION METHOD (Uses AI Model URL) ---
  async predictBindingAffinity(smiles: string, proteinSequence: string): Promise<{
    smiles: string;
    protein_sequence: string;
    binding_affinity: number;
    model_used: string;
  }> {
    // 1. Construct the specific URL for the AI model
    // Note: We do NOT use 'this.baseURL' here. We use the AI constant.
    const url = `${BINDING_AFFINITY_API}/predict`;
    
    try {
      // 2. Direct fetch to the AI service
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: We usually DON'T send your App's Auth Token to the external AI
          // unless the AI specifically requires a Bearer token.
        },
        body: JSON.stringify({
          smiles,
          protein_sequence: proteinSequence,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Prediction failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("AI Prediction Error:", error);
      if (error instanceof Error) throw error;
      throw new Error('Failed to connect to prediction service');
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);