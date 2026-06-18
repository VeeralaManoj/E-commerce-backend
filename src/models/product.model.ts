import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IProductReview {
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
}

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  category: Types.ObjectId;
  images: string[];
  stock: number;
  sku?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  reviews: IProductReview[];
  isFeatured: boolean;
  isActive: boolean;
}

const reviewSchema = new Schema<IProductReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    brand: String,
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: String,
    tags: [String],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", tags: "text", brand: "text" });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
