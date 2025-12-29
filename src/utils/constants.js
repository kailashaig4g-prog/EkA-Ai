module.exports = {
  // API Response Messages
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_EXISTS: 'User already exists',
    UNAUTHORIZED: 'Unauthorized access',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
  },

  // User Roles
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    MECHANIC: 'mechanic',
  },

  // Vehicle Makes (Common automotive brands)
  VEHICLE_MAKES: [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz',
    'Audi', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Mazda',
    'Subaru', 'Jeep', 'Tesla', 'Volvo', 'Porsche', 'Lexus',
    'Infiniti', 'Acura', 'Dodge', 'Ram', 'GMC', 'Cadillac',
  ],

  // Service Types
  SERVICE_TYPES: [
    'Oil Change',
    'Tire Rotation',
    'Brake Service',
    'Engine Tune-up',
    'Battery Replacement',
    'Transmission Service',
    'Air Filter Replacement',
    'Wheel Alignment',
    'Cooling System Service',
    'Electrical Diagnosis',
    'AC Service',
    'General Inspection',
  ],

  // Supported Languages
  LANGUAGES: {
    en: 'English',
    hi: 'Hindi',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ar: 'Arabic',
  },

  // File Upload Limits
  FILE_LIMITS: {
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_AUDIO_SIZE: 25 * 1024 * 1024, // 25MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4'],
  },

  // Cache TTL (in seconds)
  CACHE_TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 24 hours
  },

  // Rate Limits
  RATE_LIMITS: {
    AUTH: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
    API: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
    UPLOAD: { windowMs: 60 * 60 * 1000, max: 20 }, // 20 uploads per hour
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  },

  // OpenAI Model Settings
  OPENAI: {
    TEMPERATURE: 0.7,
    MAX_TOKENS: 2000,
    TOP_P: 1,
    FREQUENCY_PENALTY: 0,
    PRESENCE_PENALTY: 0,
  },
};
