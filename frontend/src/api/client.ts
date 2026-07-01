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
      const requestUrl = error.config?.url || '';
      // No redirigir para /auth/me (checkAuth espera el 401) ni si ya estamos en signin
      if (!requestUrl.includes('/auth/me') && !window.location.pathname.includes('/signin')) {
        localStorage.removeItem('auth_user');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
