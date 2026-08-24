import { Router } from 'express'
import { identifyOwner } from '../middleware.js'
import { Cart, Product } from '../models.js'
import { cartItemSchema } from '../validation.js'
import type { AuthRequest } from '../types.js'

export const cartRouter = Router()
cartRouter.use(identifyOwner)

async function getCart(ownerKey: string) {
  const cart = await Cart.findOne({ ownerKey }).lean() ?? { ownerKey, items: [] }
  const products = await Product.find({ id: { $in: cart.items.map((item) => item.productId) } }).lean()
  const items = cart.items.map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) })).filter((item) => item.product)
  return { items, cartCount: items.reduce((sum, item) => sum + item.quantity, 0), cartTotal: items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0) }
}

cartRouter.get('/', async (request: AuthRequest, response) => response.json(await getCart(request.ownerKey!)))
cartRouter.post('/items', async (request: AuthRequest, response) => {
  const parsed = cartItemSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ message: 'productId and positive integer quantity are required' })
  if (!await Product.exists({ id: parsed.data.productId })) return response.status(404).json({ message: 'Product not found' })
  const cart = await Cart.findOneAndUpdate({ ownerKey: request.ownerKey }, { $setOnInsert: { ownerKey: request.ownerKey }, $inc: { 'items.$[item].quantity': parsed.data.quantity } }, { arrayFilters: [{ 'item.productId': parsed.data.productId }], new: true, upsert: true })
  if (!cart.items.some((item) => item.productId === parsed.data.productId)) { cart.items.push(parsed.data); await cart.save() }
  response.json(await getCart(request.ownerKey!))
})
cartRouter.patch('/items/:productId', async (request: AuthRequest, response) => {
  const parsed = cartItemSchema.shape.quantity.safeParse(request.body.quantity)
  if (!parsed.success) return response.status(400).json({ message: 'Positive integer quantity is required' })
  await Cart.findOneAndUpdate({ ownerKey: request.ownerKey }, { $set: { 'items.$[item].quantity': parsed.data } }, { arrayFilters: [{ 'item.productId': request.params.productId }] })
  response.json(await getCart(request.ownerKey!))
})
cartRouter.delete('/items/:productId', async (request: AuthRequest, response) => { await Cart.findOneAndUpdate({ ownerKey: request.ownerKey }, { $pull: { items: { productId: request.params.productId } } }); response.json(await getCart(request.ownerKey!)) })
cartRouter.delete('/', async (request: AuthRequest, response) => { await Cart.findOneAndUpdate({ ownerKey: request.ownerKey }, { $set: { items: [] } }, { upsert: true }); response.json(await getCart(request.ownerKey!)) })
