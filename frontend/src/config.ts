// ============================================
// BACKEND API CONFIGURATION
// ============================================
// Hier wird die Verbindung zum Backend definiert!

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  health: `${API_URL}/api/health`,
  research: `${API_URL}/api/research`,
  history: `${API_URL}/api/history`,
  deleteHistory: (id: string) => `${API_URL}/api/history/${id}`,
};

// Appwrite Configuration
export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
};

