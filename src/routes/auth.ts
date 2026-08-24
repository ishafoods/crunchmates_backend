import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { config } from '../config.js'
import { issueToken, requireAuth } from '../middleware.js'
import { User } from '../models.js'
import { adminLoginSchema, customerSchema } from '../validation.js'
import type { AuthRequest } from '../types.js'

export const authRouter = Router()

authRouter.post('/customer', async (request, response) => {
  const parsed = customerSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ message: 'Name and valid email are required' })
  const email = parsed.data.email.toLowerCase()
  const user = await User.findOneAndUpdate({ email, role: 'customer' }, { name: parsed.data.name, email, role: 'customer' }, { upsert: true, new: true, setDefaultsOnInsert: true })
  const token = issueToken({ id: user.id, email: user.email, role: 'customer' })
  response.json({ token, user: { name: user.name, email: user.email } })
})

authRouter.post('/admin/login', async (request, response) => {
  const parsed = adminLoginSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ message: 'Email and password are required' })
  const email = parsed.data.email.toLowerCase()
  const user = await User.findOne({ email, role: 'admin' })
  const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash ?? '') : email === config.adminEmail && parsed.data.password === config.adminPassword
  if (!valid) return response.status(401).json({ message: 'Invalid admin credentials' })
  const admin = user ?? await User.create({ name: 'Crunchmates Admin', email, passwordHash: await bcrypt.hash(parsed.data.password, 12), role: 'admin' })
  response.json({ token: issueToken({ id: admin.id, email: admin.email, role: 'admin' }), admin: { email: admin.email } })
})

authRouter.get('/me', requireAuth(), async (request: AuthRequest, response) => {
  const user = await User.findById(request.auth?.userId).select('name email role')
  if (!user) return response.status(404).json({ message: 'User not found' })
  response.json({ name: user.name, email: user.email, role: user.role })
})
