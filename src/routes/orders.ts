import { Router } from "express";
import { identifyOwner, requireAuth } from "../middleware.js";
import { Cart, Order, Product } from "../models.js";
import {
  checkoutSchema,
  paymentVerificationSchema,
  statusSchema,
} from "../validation.js";
import { makeId } from "../utils.js";
import { config, razorpayEnabled } from "../config.js";
import {
  getRazorpay,
  toMinorUnits,
  verifyPaymentSignature,
} from "../razorpay.js";
import { sendOrderConfirmation } from "../notifications.js";
import type { AuthRequest } from "../types.js";

export const orderRouter = Router();

orderRouter.get("/payment-config", (_request, response) =>
  response.json({
    razorpayEnabled,
    keyId: config.razorpayKeyId,
    currency: config.currency,
  }),
);

orderRouter.post("/", identifyOwner, async (request: AuthRequest, response) => {
  const parsed = checkoutSchema.safeParse(request.body);
  if (!parsed.success)
    return response
      .status(400)
      .json({ message: "Complete checkout details are required" });
  const { paymentMethod, ...details } = parsed.data;
  if (paymentMethod === "razorpay" && !razorpayEnabled)
    return response
      .status(503)
      .json({ message: "Online payments are not configured" });
  const cart = await Cart.findOne({ ownerKey: request.ownerKey }).lean();
  if (!cart?.items.length)
    return response.status(400).json({ message: "Cart is empty" });
  const products = await Product.find({
    id: { $in: cart.items.map((item) => item.productId) },
  }).lean();
  const items = cart.items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return product
        ? {
            productId: product.id,
            name: `${product.name} ${product.flavor}`,
            price: product.price,
            quantity: item.quantity,
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  if (!items.length)
    return response
      .status(400)
      .json({ message: "Cart products are unavailable" });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderId = makeId("order");

  let razorpayOrder: {
    id: string;
    amount: number | string;
    currency: string;
  } | null = null;
  if (paymentMethod === "razorpay") {
    const razorpay = getRazorpay();
    if (!razorpay)
      return response
        .status(503)
        .json({ message: "Online payments are not configured" });
    razorpayOrder = await razorpay.orders.create({
      amount: toMinorUnits(total),
      currency: config.currency,
      receipt: orderId,
      notes: { orderId, customerEmail: details.customerEmail },
    });
  }

  const order = await Order.create({
    id: orderId,
    customerId: request.auth?.userId,
    ownerKey: request.ownerKey,
    ...details,
    items,
    total,
    currency: config.currency,
    paymentMethod,
    paymentStatus: "pending",
    razorpayOrderId: razorpayOrder?.id,
  });

  // Cash orders are final immediately; online orders keep the cart until payment succeeds.
  if (paymentMethod === "cod") {
    await Cart.updateOne(
      { ownerKey: request.ownerKey },
      { $set: { items: [] } },
    );
    void sendOrderConfirmation(order.toObject());
  }

  response.status(201).json({
    order,
    razorpay: razorpayOrder
      ? {
          keyId: config.razorpayKeyId,
          orderId: razorpayOrder.id,
          amount: Number(razorpayOrder.amount),
          currency: razorpayOrder.currency,
        }
      : null,
  });
});

orderRouter.post(
  "/:id/verify-payment",
  identifyOwner,
  async (request: AuthRequest, response) => {
    const parsed = paymentVerificationSchema.safeParse(request.body);
    if (!parsed.success)
      return response.status(400).json({ message: "Invalid payment payload" });
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      parsed.data;
    const order = await Order.findOne({
      id: request.params.id,
      ownerKey: request.ownerKey,
    });
    if (!order)
      return response.status(404).json({ message: "Order not found" });
    if (order.razorpayOrderId !== razorpayOrderId)
      return response
        .status(400)
        .json({ message: "Payment does not match this order" });
    if (order.paymentStatus === "paid") return response.json(order);

    if (
      !verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      )
    ) {
      order.set({ paymentStatus: "failed" });
      await order.save();
      return response
        .status(400)
        .json({ message: "Payment verification failed" });
    }

    order.set({ paymentStatus: "paid", razorpayPaymentId, razorpaySignature });
    await order.save();
    await Cart.updateOne(
      { ownerKey: request.ownerKey },
      { $set: { items: [] } },
    );
    void sendOrderConfirmation(order.toObject());
    response.json(order);
  },
);

orderRouter.post(
  "/:id/payment-failed",
  identifyOwner,
  async (request: AuthRequest, response) => {
    const order = await Order.findOneAndUpdate(
      {
        id: request.params.id,
        ownerKey: request.ownerKey,
        paymentStatus: "pending",
      },
      { paymentStatus: "failed" },
      { new: true },
    );
    if (!order)
      return response.status(404).json({ message: "Order not found" });
    response.json(order);
  },
);

orderRouter.get(
  "/me",
  requireAuth("customer"),
  async (request: AuthRequest, response) =>
    response.json(
      await Order.find({ customerId: request.auth?.userId })
        .sort({ createdAt: -1 })
        .lean(),
    ),
);
orderRouter.get("/admin", requireAuth("admin"), async (_request, response) =>
  response.json(await Order.find().sort({ createdAt: -1 }).lean()),
);
orderRouter.patch(
  "/admin/:id/status",
  requireAuth("admin"),
  async (request, response) => {
    const parsed = statusSchema.safeParse(request.body.status);
    if (!parsed.success)
      return response.status(400).json({ message: "Invalid order status" });
    const order = await Order.findOneAndUpdate(
      { id: request.params.id },
      { status: parsed.data },
      { new: true },
    );
    if (!order)
      return response.status(404).json({ message: "Order not found" });
    response.json(order);
  },
);
