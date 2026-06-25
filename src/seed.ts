import { connectDatabase } from "./config/db.js";
import { Category } from "./models/category.model.js";
import { Product } from "./models/product.model.js";
import { User } from "./models/user.model.js";

const run = async () => {
  await connectDatabase();
  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany()]);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "Password123!",
    phone: "1000000000",
    role: "ADMIN"
  });

  await User.create({
    name: "Demo Customer",
    email: "customer@example.com",
    password: "Password123!",
    phone: "1000000001",
    role: "CUSTOMER"
  });

  const electronics = await Category.create({
    name: "Electronics",
    slug: "electronics",
    description: "Everyday devices and accessories"
  });

  const apparel = await Category.create({
    name: "Apparel",
    slug: "apparel",
    description: "Comfortable wardrobe essentials"
  });

  await Product.create([
    {
      name: "Wireless Noise Cancelling Headphones",
      slug: "wireless-noise-cancelling-headphones",
      description: "Comfortable over-ear headphones with long battery life and clear calls.",
      brand: "Acme Audio",
      price: 129.99,
      compareAtPrice: 169.99,
      category: electronics._id,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"],
      stock: 50,
      tags: ["audio", "wireless"],
      isFeatured: true,
      reviews: [{ user: admin._id, name: admin.name, rating: 5, comment: "Excellent quality." }],
      rating: 5,
      reviewCount: 1
    },
    {
      name: "Organic Cotton Hoodie",
      slug: "organic-cotton-hoodie",
      description: "Soft midweight hoodie with a relaxed fit and durable stitching.",
      brand: "Northline",
      price: 64,
      category: apparel._id,
      images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7"],
      stock: 80,
      tags: ["hoodie", "cotton"],
      isFeatured: true
    }
  ]);

  console.log("Seed data inserted");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
