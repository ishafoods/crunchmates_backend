import { Router } from "express";
import { requireAuth } from "../middleware.js";
import { Product } from "../models.js";
import { productSchema } from "../validation.js";
import { makeId, slugify } from "../utils.js";

export const productRouter = Router();
productRouter.get("/", async (_request, response) =>
  response.json(await Product.find().sort({ createdAt: -1 }).lean()),
);
productRouter.get("/:slug", async (request, response) => {
  const product = await Product.findOne({
    $or: [{ slug: request.params.slug }, { id: request.params.slug }],
  }).lean();
  if (!product)
    return response.status(404).json({ message: "Product not found" });
  response.json(product);
});
productRouter.post("/", requireAuth("admin"), async (request, response) => {
  const parsed = productSchema.safeParse(request.body);
  if (!parsed.success)
    return response
      .status(400)
      .json({ message: "Invalid product", issues: parsed.error.issues });
  const data = parsed.data;
  const product = await Product.create({
    ...data,
    id: makeId("product"),
    slug: slugify(`${data.name}-${data.flavor}`),
  });
  response.status(201).json(product);
});
productRouter.patch("/:id", requireAuth("admin"), async (request, response) => {
  const parsed = productSchema.partial().safeParse(request.body);
  if (!parsed.success)
    return response
      .status(400)
      .json({ message: "Invalid product update", issues: parsed.error.issues });
  const product = await Product.findOneAndUpdate(
    { id: request.params.id },
    { $set: parsed.data },
    { new: true, runValidators: true },
  );
  if (!product)
    return response.status(404).json({ message: "Product not found" });
  response.json(product);
});
productRouter.delete(
  "/:id",
  requireAuth("admin"),
  async (request, response) => {
    const result = await Product.deleteOne({ id: request.params.id });
    if (!result.deletedCount)
      return response.status(404).json({ message: "Product not found" });
    response.status(204).send();
  },
);
