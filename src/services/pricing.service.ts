import { Product } from "../models/product.model.js";
import { AppError } from "../utils/app-error.js";

export type IncomingCartItem = {
  productId: string;
  quantity: number;
};

export const priceItems = async (items: IncomingCartItem[]) => {
  const ids = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids }, isActive: true });

  return items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) throw new AppError("One or more products are unavailable", 400);
    if (product.stock < item.quantity) {
      throw new AppError(`${product.name} has only ${product.stock} in stock`, 400);
    }

    return {
      product,
      quantity: item.quantity,
      price: product.price,
      lineTotal: product.price * item.quantity
    };
  });
};

export const calculateTotals = (items: Array<{ lineTotal: number }>) => {
  const itemsPrice = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 10;
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};
