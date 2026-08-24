import { Router } from 'express'
import { requireAuth } from '../middleware.js'
import { Order, Product, SiteContent, User } from '../models.js'

export const adminRouter = Router()
adminRouter.use(requireAuth('admin'))
adminRouter.get('/dashboard', async (_request, response) => response.json({ products: await Product.countDocuments(), orders: await Order.countDocuments(), editableBlocks: (await SiteContent.findOne({ key: 'main' }).lean())?.blocks?.length ?? 0, customerProfiles: await User.countDocuments({ role: 'customer' }) }))
adminRouter.get('/orders', async (_request, response) => response.json(await Order.find().sort({ createdAt: -1 }).lean()))
