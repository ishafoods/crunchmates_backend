import nodemailer from 'nodemailer'
import twilio from 'twilio'
import { config, emailEnabled, smsEnabled } from './config.js'

export type OrderNotification = {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  city: string
  total: number
  currency?: string | null
  paymentMethod?: string | null
  paymentStatus?: string | null
  razorpayPaymentId?: string | null
  items: Array<{ name?: string | null; price?: number | null; quantity?: number | null }>
}

let mailer: nodemailer.Transporter | null = null
let smsClient: ReturnType<typeof twilio> | null = null

function getMailer() {
  if (!emailEnabled) return null
  if (!mailer)
    mailer = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: { user: config.smtpUser, pass: config.smtpPassword },
    })
  return mailer
}

function getSmsClient() {
  if (!smsEnabled) return null
  if (!smsClient) smsClient = twilio(config.twilioAccountSid, config.twilioAuthToken)
  return smsClient
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] as string,
  )
}

/** Twilio requires E.164, so bare local numbers get the configured country code. */
function toE164(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits.startsWith('+') ? digits : `${config.defaultCountryCode}${digits}`
}

function buildEmail(order: OrderNotification) {
  const currency = order.currency ?? config.currency
  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 12px 6px 0">${escapeHtml(item.name ?? 'Item')} x ${item.quantity ?? 0}</td><td align="right" style="padding:6px 0">${currency} ${(item.price ?? 0) * (item.quantity ?? 0)}</td></tr>`,
    )
    .join('')
  const paymentLine =
    order.paymentMethod === 'cod'
      ? 'Cash on delivery'
      : `Paid online${order.razorpayPaymentId ? ` (payment ${escapeHtml(order.razorpayPaymentId)})` : ''}`

  return {
    subject: `${config.storeName} order ${order.id} confirmed`,
    text: [
      `Hi ${order.customerName},`,
      `Your order ${order.id} is confirmed.`,
      ...order.items.map((item) => `- ${item.name} x ${item.quantity} = ${currency} ${(item.price ?? 0) * (item.quantity ?? 0)}`),
      `Total: ${currency} ${order.total}`,
      `Payment: ${order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online'}`,
      `Delivering to: ${order.address}, ${order.city}`,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;color:#222">
        <h2>Thanks for your order, ${escapeHtml(order.customerName)}!</h2>
        <p>Order <strong>${escapeHtml(order.id)}</strong> is confirmed and being packed.</p>
        <table style="border-collapse:collapse;margin:16px 0">${rows}
          <tr><td style="border-top:1px solid #ddd;padding:8px 12px 0 0"><strong>Total</strong></td><td align="right" style="border-top:1px solid #ddd;padding:8px 0"><strong>${currency} ${order.total}</strong></td></tr>
        </table>
        <p>${paymentLine}</p>
        <p>Delivering to:<br />${escapeHtml(order.address)}<br />${escapeHtml(order.city)}</p>
      </div>`,
  }
}

function buildSms(order: OrderNotification) {
  const currency = order.currency ?? config.currency
  const payment = order.paymentMethod === 'cod' ? 'Pay cash on delivery' : 'Payment received'
  return `${config.storeName}: Order ${order.id} confirmed. ${order.items.length} item(s), total ${currency} ${order.total}. ${payment}. Shipping to ${order.city}.`
}

/** Notifications must never break checkout, so failures are logged and swallowed. */
export async function sendOrderConfirmation(order: OrderNotification) {
  const transport = getMailer()
  const sms = getSmsClient()

  const tasks: Array<Promise<unknown>> = []

  if (transport)
    tasks.push(
      transport
        .sendMail({ from: config.mailFrom, to: order.customerEmail, ...buildEmail(order) })
        .catch((error) => console.error(`Order ${order.id}: confirmation email failed`, error)),
    )
  else console.warn(`Order ${order.id}: email not configured, skipping confirmation email`)

  if (sms)
    tasks.push(
      sms.messages
        .create({ from: config.twilioFromNumber, to: toE164(order.customerPhone), body: buildSms(order) })
        .catch((error) => console.error(`Order ${order.id}: confirmation SMS failed`, error)),
    )
  else console.warn(`Order ${order.id}: SMS not configured, skipping confirmation SMS`)

  await Promise.all(tasks)
}
