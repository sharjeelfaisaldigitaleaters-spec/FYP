// In production, set VITE_API_URL in the hosting dashboard (e.g. Vercel) to
// point at the deployed backend — falls back to local dev default otherwise.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const BASE_URL = API_BASE_URL;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('mk_access_token');
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // If we are passing FormData, do NOT set Content-Type to application/json
  // fetch automatically sets multipart/form-data with the correct boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Error: ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
    } catch(e) {
        // ignore JSON parse error for error response
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
