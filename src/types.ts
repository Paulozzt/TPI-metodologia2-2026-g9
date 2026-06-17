/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'simple' | 'kit';
  stock: number;
  minStock: number;
  category: string;
  imageUrl?: string;
  components?: { productId: string; name: string; quantity: number }[]; // For Kits
}

export interface Client {
  id: string;
  name: string;
  email: string;
  region: string; // e.g., "Zona Norte", "Zona Centro", etc.
  address: string;
  totalOrdersCount?: number;
}

export interface Coupon {
  id: string;
  code: string; // e.g., "NEON20"
  discountAmount: number; // in pesos
  validityStart: string; // YYYY-MM-DD
  validityEnd: string; // YYYY-MM-DD
  applicableProductIds: string[]; // empty fits "all products", or matches specific IDs
  assignedClientIds: string[]; // associated clients
  usedByClientIds: string[]; // clients who already confirmed payment with this coupon
  active: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  date: string; // YYYY-MM-DD
  items: OrderItem[];
  subtotal: number;
  couponCode?: string;
  discountApplied: number;
  total: number;
  status: 'pending_payment' | 'paid' | 'cancelled';
  deliveryAddress: string;
  region: string;
  trackingNumber?: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  timestamp: string;
}
