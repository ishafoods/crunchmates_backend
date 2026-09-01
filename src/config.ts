import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/crunchmates',
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret-change-me',
  adminEmail: (process.env.ADMIN_EMAIL ?? 'admin@crunchmates.com').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  currency: process.env.CURRENCY ?? 'INR',
  storeName: process.env.STORE_NAME ?? 'Crunchmates',
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPassword: process.env.SMTP_PASSWORD ?? '',
  mailFrom: process.env.MAIL_FROM ?? 'Crunchmates <no-reply@crunchmates.com>',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? '',
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER ?? '',
  defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE ?? '+91',
}

export const razorpayEnabled = Boolean(config.razorpayKeyId && config.razorpayKeySecret)
export const emailEnabled = Boolean(config.smtpHost && config.smtpUser && config.smtpPassword)
export const smsEnabled = Boolean(config.twilioAccountSid && config.twilioAuthToken && config.twilioFromNumber)
