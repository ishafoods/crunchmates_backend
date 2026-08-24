import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/crunchmates',
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret-change-me',
  adminEmail: (process.env.ADMIN_EMAIL ?? 'admin@crunchmates.com').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
}
