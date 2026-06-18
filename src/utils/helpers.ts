import { Coupon, Product, Client, EmailLog } from '../types';

/**
 * Validates if a coupon can be applied to a specific cart and client
 */
export function validateCoupon(
  coupon: Coupon,
  cart: { product: Product; quantity: number }[],
  client: Client | null
): { isValid: boolean; reason?: string } {
  if (!coupon.active) {
    return { isValid: false, reason: 'El cupón se encuentra inactivo.' };
  }

  // Check validity dates
  const todayStr = new Date().toISOString().substring(0, 10);
  if (todayStr < coupon.validityStart) {
    return { isValid: false, reason: `El cupón no está vigente aún. Válido desde: ${coupon.validityStart}` };
  }
  if (todayStr > coupon.validityEnd) {
    return { isValid: false, reason: `El cupón ha expirado. Vencimiento: ${coupon.validityEnd}` };
  }

  // Check client assignment criteria
  if (client) {
    // If the coupon has assigned clients, make sure this client is one of them
    if (coupon.assignedClientIds.length > 0 && !coupon.assignedClientIds.includes(client.id)) {
      return { isValid: false, reason: 'Este cupón está asignado a otros clientes específicos.' };
    }

    // Check if client already used this coupon
    if (coupon.usedByClientIds.includes(client.id)) {
      return { isValid: false, reason: 'Usted ya ha utilizado este cupón de descuento.' };
    }
  }

  // Calculate cart total
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Rule: "el descuento solo se aplica si el monto del pedido supera el descuento obtenido"
  if (cartSubtotal <= coupon.discountAmount) {
    return {
      isValid: false,
      reason: `El monto total de la compra ($${cartSubtotal}) debe ser mayor al descuento del cupón ($${coupon.discountAmount}).`
    };
  }

  // Rule: "productos abarcados"
  if (coupon.applicableProductIds && coupon.applicableProductIds.length > 0) {
    const hasCoveredProduct = cart.some(item => coupon.applicableProductIds.includes(item.product.id));
    if (!hasCoveredProduct) {
      return {
        isValid: false,
        reason: 'El carro no contiene ninguno de los productos o kits abarcados por esta promoción.'
      };
    }
  }

  return { isValid: true };
}

/**
 * Helper to simulate sending emails
 */
export function simulateSendEmail(
  client: Client,
  coupon: Coupon
): EmailLog {
  const code = coupon.code;
  const discount = coupon.discountAmount;
  const validityEndStr = coupon.validityEnd;

  const subject = `¡Descuento Exclusivo de Body Paint para vos! Código: ${code}`;
  
  const body = `Hola ${client.name},

¡Tenemos excelentes noticias! Te hemos asignado un cupón de descuento exclusivo de $${discount} para tus próximas compras en nuestra tienda de Body Paint.

CÓDIGO DE CUPÓN: ${code}
DESCUENTO: $${discount} ARS
VÁLIDO HASTA: ${validityEndStr}

* Recuerda que el cupón es válido para compras que superen los $${discount} y aplica para productos seleccionados.

¡Que te diviertas creando!
El Equipo de Body Paint.`;

  return {
    id: `email-${Math.random().toString(36).substr(2, 9)}`,
    recipientEmail: client.email,
    recipientName: client.name,
    subject,
    body,
    timestamp: new Date().toLocaleTimeString(),
  };
}
