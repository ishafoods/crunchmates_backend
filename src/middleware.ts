import type { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from './config.js'
import type { AuthRequest, Role } from './types.js'

export function issueToken(user: { id: string; email: string; role: Role }) {
  return jwt.sign({ role: user.role, email: user.email }, config.jwtSecret, { subject: user.id, expiresIn: '7d' })
}

function readToken(request: AuthRequest) {
  const header = request.header('authorization')
  if (!header?.startsWith('Bearer ')) return null
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as jwt.JwtPayload & { role: Role; email: string }
    return { userId: String(payload.sub), role: payload.role, email: payload.email }
  } catch { return null }
}

export function identifyOwner(request: AuthRequest, _response: Response, next: NextFunction) {
  const auth = readToken(request)
  if (auth?.role === 'customer') {
    request.auth = auth
    request.ownerKey = `user:${auth.userId}`
  } else {
    request.ownerKey = `guest:${request.header('x-session-id') ?? request.ip}`
  }
  next()
}

export function requireAuth(role?: Role) {
  return (request: AuthRequest, response: Response, next: NextFunction) => {
    const auth = readToken(request)
    if (!auth || (role && auth.role !== role)) return response.status(401).json({ message: 'Authentication required' })
    request.auth = auth
    next()
  }
}

export function errorHandler(error: unknown, _request: AuthRequest, response: Response, _next: NextFunction) {
  console.error(error)
  response.status(500).json({ message: 'Internal server error' })
}
