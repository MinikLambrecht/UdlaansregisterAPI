require('dotenv').config(); // Get variables

// Application Related
export const AppPort = process.env.PORT;
export const EnvMode = process.env.NODE_ENV;

// Security Related
export const SessionSecret = process.env.SESSION_SECRET; // 512-bit secret
export const JWTSecret = process.env.JWT_SECRET; // 2048-bit secret
export const CryptoSecret = process.env.CRYPTO_SECRET; // 4096-bit secret

// Database Related
export const DBDialect = process.env.DB_DIALECT;
export const DBHost = process.env.DB_HOST;
export const DBPort = process.env.DB_PORT;
export const DBUser = process.env.DB_USER;
export const DBPass = process.env.DB_PASS;
export const DBName = process.env.DB_NAME;
export const DBPoolMax = process.env.DB_POOL_MAX;
export const DBPoolMin = process.env.DB_POOL_MIN;
export const DBPoolAquire = process.env.DB_POOL_ACQUIRE;
export const DBPoolIdle = process.env.DB_POOL_IDLE;

// Directories
export const LoggingDir = EnvMode === 'production' ? `${__dirname}/Logs` : 'Src/Logs';