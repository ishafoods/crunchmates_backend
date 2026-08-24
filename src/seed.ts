import bcrypt from "bcryptjs";
import { connectDatabase } from "./db.js";
import { config } from "./config.js";
import { Product, SiteContent, User } from "./models.js";

const products = [
  {
    id: "indian-spice-punch",
    slug: "indian-spice-punch",
    name: "Crunchmates Rice Crisps",
    flavor: "Indian Spice Punch",
    tagline: "Bold spice. Big crunch.",
    description:
      "A light, crispy rice snack with a bold Indian Spice Punch and a seriously satisfying crunch.",
    price: 0,
    priceNote: "Price available at checkout",
    badge: "Launch Flavor",
    category: "Rice Crisps",
    ingredients: ["Information coming soon"],
    features: [
      "Rice Crisps",
      "Indian Spice Punch",
      "Popped, Not Fried Nor Baked",
    ],
    nutrition: ["Information coming soon"],
    tone: {
      background: "linear-gradient(160deg, #063BCE 0%, #031B72 100%)",
      accent: "#E21B12",
      highlight: "#FFC928",
    },
    featured: true,
  },
  {
    id: "coming-soon-1",
    slug: "coming-soon-1",
    name: "Crunchmates Rice Crisps",
    flavor: "Coming Soon",
    tagline: "Next crunch drop loading.",
    description: "New flavor reveal coming soon.",
    price: 0,
    priceNote: "Price to be announced",
    badge: "Coming Soon",
    category: "Rice Crisps",
    ingredients: ["Information coming soon"],
    features: ["CRISPY", "BOLD", "COMING SOON"],
    nutrition: ["Information coming soon"],
    tone: {
      background: "linear-gradient(160deg, #008CFF 0%, #063BCE 100%)",
      accent: "#FFC928",
      highlight: "#FFF8E8",
    },
    featured: false,
    comingSoon: true,
  },
  {
    id: "coming-soon-2",
    slug: "coming-soon-2",
    name: "Crunchmates Rice Crisps",
    flavor: "Coming Soon",
    tagline: "Another flavor is on the way.",
    description: "New flavor reveal coming soon.",
    price: 0,
    priceNote: "Price to be announced",
    badge: "Coming Soon",
    category: "Rice Crisps",
    ingredients: ["Information coming soon"],
    features: ["CRISPY", "BOLD", "COMING SOON"],
    nutrition: ["Information coming soon"],
    tone: {
      background: "linear-gradient(160deg, #031B72 0%, #063BCE 100%)",
      accent: "#E21B12",
      highlight: "#FFC928",
    },
    featured: false,
    comingSoon: true,
  },
  {
    id: "coming-soon-3",
    slug: "coming-soon-3",
    name: "Crunchmates Rice Crisps",
    flavor: "Coming Soon",
    tagline: "More crunch stories ahead.",
    description: "New flavor reveal coming soon.",
    price: 0,
    priceNote: "Price to be announced",
    badge: "Coming Soon",
    category: "Rice Crisps",
    ingredients: ["Information coming soon"],
    features: ["CRISPY", "BOLD", "COMING SOON"],
    nutrition: ["Information coming soon"],
    tone: {
      background: "linear-gradient(160deg, #063BCE 0%, #008CFF 100%)",
      accent: "#A90000",
      highlight: "#FFC928",
    },
    featured: false,
    comingSoon: true,
  },
];

const content = {
  key: "main",
  announcement:
    "BOLD SPICE. BIG CRUNCH. Crunchmates Rice Crisps - Indian Spice Punch.",
  heroEyebrow: "MEET YOUR NEW CRUNCHMATE",
  heroTitle: "BOLD SPICE.\nBIG CRUNCH.",
  heroSubtitle:
    "Crunchmates Rice Crisps bring together a light, crispy texture with an exciting Indian Spice Punch.",
  primaryCta: "SHOP NOW",
  secondaryCta: "DISCOVER THE CRUNCH",
  storyTitle: "EVERY GREAT SNACK NEEDS A LITTLE ATTITUDE.",
  storyText:
    "Crunchmates is built around one simple idea: snacks should be fun. Bold flavours, satisfying crunch and a little Indian spice energy come together to create a snack made for modern snack lovers.",
  stats: [
    { label: "Texture", value: "POPPED" },
    { label: "Flavour", value: "BOLD" },
    { label: "Style", value: "SPICY" },
  ],
  spiceMeterTitle: "Heat with balance, crunch with attitude.",
  spiceMeterText: "Indian Spice Punch is tuned to feel bold and snackable, not overwhelming.",
  spiceMeterValue: 78,
  spiceMeterStartLabel: "Mild",
  spiceMeterEndLabel: "Bold",
  snackMomentsTitle: "Built for every crunchy situation.",
  snackMoments: ["Movie Nights", "Tea Breaks", "Road Trips", "Party Bowls"],
  socialProofTitle: "What snack fans say",
  socialProofQuotes: [
    "Unexpectedly crunchy. Instantly addictive.",
    "That spice lift is exactly what snack time needed.",
    "Finally, a rice crisp that feels fun and bold.",
  ],
  newsletterTitle: "Get first bite updates.",
  newsletterText: "Flavor drops, launch news, and snack stories - straight to your inbox.",
  newsletterCta: "JOIN THE LIST",
  finalCtaTitle: "Ready for the crunch upgrade?",
  finalCtaPrimary: "SHOP INDIAN SPICE PUNCH",
  finalCtaSecondary: "EXPLORE COMING SOON",
  blocks: [
    {
      id: "rice-crisps",
      title: "RICE CRISPS",
      text: "Light, crispy and seriously satisfying.",
      accent: "#FFC928",
    },
    {
      id: "spice-punch",
      title: "INDIAN SPICE PUNCH",
      text: "Bold flavour inspired by the excitement of Indian spices.",
      accent: "#E21B12",
    },
    {
      id: "popped",
      title: "POPPED",
      text: "Popped, not fried nor baked - the kind of crunch that keeps you reaching for another.",
      accent: "#008CFF",
    },
    {
      id: "crunch-energy",
      title: "BIG CRUNCH ENERGY",
      text: "Made for snack attacks, sharing sessions and everything in between.",
      accent: "#FFC928",
    },
  ],
};

await connectDatabase();
await Product.deleteMany({});
await Product.insertMany(products);
await SiteContent.findOneAndUpdate({ key: "main" }, content, {
  upsert: true,
  new: true,
});
await User.findOneAndUpdate(
  { email: config.adminEmail },
  {
    name: "Crunchmates Admin",
    email: config.adminEmail,
    passwordHash: await bcrypt.hash(config.adminPassword, 12),
    role: "admin",
  },
  { upsert: true, new: true },
);
console.log("Seed complete");
process.exit(0);
