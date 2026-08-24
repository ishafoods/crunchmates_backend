import type { Request } from 'express'

export type Role = 'customer' | 'admin'
export type OrderStatus = 'Processing' | 'Packed' | 'Shipped' | 'Delivered'

export type AuthRequest = Request & {
  auth?: { userId: string; role: Role; email: string }
  ownerKey?: string
}
