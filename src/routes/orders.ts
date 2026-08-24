import { Router } from 'express'
import { identifyOwner, requireAuth } from '../middleware.js'
import { Cart, Order, Product } from '../models.js'
import { checkoutSchema, statusSchema } from '../validation.js'
import { makeId } from '../utils.js'
import type { AuthRequest } from '../types.js'

export const orderRouter = Router()
orderRouter.post('/', identifyOwner, async (request: AuthRequest, response) => {
  const parsed = checkoutSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ message: 'Complete checkout details are required' })
  const cart = await Cart.findOne({ ownerKey: request.ownerKey }).lean()
  if (!cart?.items.length) return response.status(400).json({ message: 'Cart is empty' })
  const products = await Product.find({ id: { $in: cart.items.map((item) => item.productId) } }).lean()
  const items = cart.items.map((item) => { const product = products.find((entry) => entry.id === item.productId); return product ? { productId: product.id, name: `${product.name} ${product.flavor}`, price: product.price, quantity: item.quantity } : null }).filter((item): item is NonNullable<typeof item> => Boolean(item))
  if (!items.length) return response.status(400).json({ message: 'Cart products are unavailable' })
  const order = await Order.create({ id: makeId('order'), customerId: request.auth?.userId, ...parsed.data, items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) })
  await Cart.updateOne({ ownerKey: request.ownerKey }, { $set: { items: [] } })
  response.status(201).json(order)
})
orderRouter.get('/me', requireAuth('customer'), async (request: AuthRequest, response) => response.json(await Order.find({ customerId: request.auth?.userId }).sort({ createdAt: -1 }).lean()))
orderRouter.get('/admin', requireAuth('admin'), async (_request, response) => response.json(await Order.find().sort({ createdAt: -1 }).lean()))
orderRouter.patch('/admin/:id/status', requireAuth('admin'), async (request, response) => {
  const parsed = statusSchema.safeParse(request.body.status)
  if (!parsed.success) return response.status(400).json({ message: 'Invalid order status' })
  const order = await Order.findOneAndUpdate({ id: request.params.id }, { status: parsed.data }, { new: true })
  if (!order) return response.status(404).json({ message: 'Order not found' })
  response.json(order)
})
