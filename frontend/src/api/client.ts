import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9050/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cookie httpOnly — la autenticación viaja en la cookie, no en headers
});

// Interceptor de respuestas — manejar 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Cookie expirada o inválida — redirigir a login
      localStorage.removeItem('auth_user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
