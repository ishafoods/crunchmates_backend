import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { connectDatabase } from './db.js'
import { config } from './config.js'
import { errorHandler } from './middleware.js'
import { authRouter } from './routes/auth.js'
import { productRouter } from './routes/products.js'
import { contentRouter } from './routes/content.js'
import { cartRouter } from './routes/cart.js'
import { orderRouter } from './routes/orders.js'
import { adminRouter } from './routes/admin.js'
import { Product, SiteContent } from './models.js'

const app = express()

const _helmet = (helmet as any)?.default ?? helmet

app.use(_helmet())
app.use(cors({ origin: config.frontendOrigin }))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))
app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'crunchmates-api' }))
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/content', contentRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', orderRouter)
app.use('/api/admin', adminRouter)
app.get('/api/catalog', async (_request, response) => {
	const [products, content] = await Promise.all([
		Product.find().sort({ createdAt: -1 }).lean(),
		SiteContent.findOne({ key: 'main' }).lean(),
	])
	response.json({ products, content })
})
app.use((_request, response) => response.status(404).json({ message: 'Route not found' }))
app.use(errorHandler)

await connectDatabase()
app.listen(config.port, () => console.log(`Crunchmates API listening on http://localhost:${config.port}`))

export default app;