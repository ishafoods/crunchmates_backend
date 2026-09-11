import mongoose, { Schema } from "mongoose";

const toneSchema = new Schema(
  {
    background: { type: String, required: true },
    accent: { type: String, required: true },
    highlight: { type: String, required: true },
  },
  { _id: false },
);
const statsSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    image: String,
  },
  { _id: false },
);
const showcaseImageSchema = new Schema(
  {
    id: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);
const promoSlideSchema = new Schema(
  {
    id: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
  },
  { _id: false },
);
const blockSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    accent: { type: String, required: true },
    image: String,
  },
  { _id: false },
);

export const Product = mongoose.model(
  "Product",
  new Schema(
    {
      id: { type: String, required: true, unique: true },
      slug: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      flavor: { type: String, required: true },
      tagline: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      priceNote: String,
      badge: { type: String, required: true },
      category: { type: String, required: true },
      ingredients: [String],
      features: [String],
      nutrition: [String],
      image: String,
      tone: { type: toneSchema, required: true },
      featured: { type: Boolean, default: false },
      comingSoon: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);

export const SiteContent = mongoose.model(
  "SiteContent",
  new Schema(
    {
      key: { type: String, default: "main", unique: true },
      announcement: String,
      heroTitle: String,
      heroSubtitle: String,
      heroEyebrow: String,
      primaryCta: String,
      secondaryCta: String,
      storyTitle: String,
      storyText: String,
      stats: [statsSchema],
      promoSlides: [promoSlideSchema],
      showcaseImages: [showcaseImageSchema],
      blocks: [blockSchema],
      spiceMeterTitle: String,
      spiceMeterText: String,
      spiceMeterValue: Number,
      spiceMeterStartLabel: String,
      spiceMeterEndLabel: String,
      snackMomentsTitle: String,
      snackMoments: [String],
      socialProofTitle: String,
      socialProofQuotes: [String],
      newsletterTitle: String,
      newsletterText: String,
      newsletterCta: String,
      finalCtaTitle: String,
      finalCtaPrimary: String,
      finalCtaSecondary: String,
    },
    { timestamps: true },
  ),
);

export const User = mongoose.model(
  "User",
  new Schema(
    {
      name: { type: String, required: true },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      passwordHash: String,
      role: { type: String, enum: ["customer", "admin"], default: "customer" },
    },
    { timestamps: true },
  ),
);

const cartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);
export const Cart = mongoose.model(
  "Cart",
  new Schema(
    {
      ownerKey: { type: String, required: true, unique: true },
      items: [cartItemSchema],
    },
    { timestamps: true },
  ),
);

const orderItemSchema = new Schema(
  { productId: String, name: String, price: Number, quantity: Number },
  { _id: false },
);
export const Order = mongoose.model(
  "Order",
  new Schema(
    {
      id: { type: String, required: true, unique: true },
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      ownerKey: { type: String, index: true },
      customerName: { type: String, required: true },
      customerEmail: { type: String, required: true, lowercase: true },
      customerPhone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      status: {
        type: String,
        enum: ["Processing", "Packed", "Shipped", "Delivered"],
        default: "Processing",
      },
      createdAt: { type: Date, default: Date.now },
      items: [orderItemSchema],
      total: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR" },
      paymentMethod: {
        type: String,
        enum: ["razorpay", "cod"],
        default: "razorpay",
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: String,
      razorpaySignature: String,
    },
    { timestamps: true },
  ),
);
