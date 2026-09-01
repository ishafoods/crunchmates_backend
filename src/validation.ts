import { z } from 'zod'

export const customerSchema = z.object({ name: z.string().trim().min(1), email: z.email() })
export const adminLoginSchema = z.object({ email: z.email(), password: z.string().min(1) })
export const checkoutSchema = z.object({ customerName: z.string().trim().min(1), customerEmail: z.email(), customerPhone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number'), address: z.string().trim().min(1), city: z.string().trim().min(1), paymentMethod: z.enum(['razorpay', 'cod']).default('razorpay') })
export const paymentVerificationSchema = z.object({ razorpayOrderId: z.string().min(1), razorpayPaymentId: z.string().min(1), razorpaySignature: z.string().min(1) })
export const cartItemSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1) })
export const productSchema = z.object({ name: z.string().min(1), flavor: z.string().min(1), tagline: z.string(), description: z.string(), price: z.number().nonnegative(), priceNote: z.string().optional(), badge: z.string(), category: z.string(), ingredients: z.array(z.string()), features: z.array(z.string()), nutrition: z.array(z.string()), image: z.string().optional(), tone: z.object({ background: z.string(), accent: z.string(), highlight: z.string() }), featured: z.boolean().default(true), comingSoon: z.boolean().optional() })
export const statusSchema = z.enum(['Processing', 'Packed', 'Shipped', 'Delivered'])
