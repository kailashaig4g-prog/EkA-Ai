const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
};

export default config;
