import crypto from 'node:crypto'
import Razorpay from 'razorpay'
import { config, razorpayEnabled } from './config.js'

let client: Razorpay | null = null

export function getRazorpay() {
  if (!razorpayEnabled) return null
  if (!client) client = new Razorpay({ key_id: config.razorpayKeyId, key_secret: config.razorpayKeySecret })
  return client
}

/** Razorpay works in the smallest currency unit (paise for INR). */
export function toMinorUnits(amount: number) {
  return Math.round(amount * 100)
}

export function verifyPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
  const expected = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const providedBuffer = Buffer.from(signature, 'utf8')
  if (expectedBuffer.length !== providedBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer)
}
