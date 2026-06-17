/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Client, Coupon, Order } from '../types';

// Initial Products list (Simples and Kits)
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Pintura Corporal Fluo - Neón Amarillo (100ml)',
    price: 1800,
    type: 'simple',
    stock: 45,
    minStock: 10,
    category: 'Pinturas',
  },
  {
    id: 'p2',
    name: 'Pintura Corporal Fluo - Neón Rosa (100ml)',
    price: 1800,
    type: 'simple',
    stock: 8, // Near Minimum! (minStock is 10)
    minStock: 10,
    category: 'Pinturas',
  },
  {
    id: 'p3',
    name: 'Pintura Corporal Metalizada - Oro Imperial (120ml)',
    price: 2500,
    type: 'simple',
    stock: 25,
    minStock: 8,
    category: 'Pinturas',
  },
  {
    id: 'p4',
    name: 'Pintura Corporal Metalizada - Plata Fina (120ml)',
    price: 2500,
    type: 'simple',
    stock: 5, // Below Minimum! (minStock is 8)
    minStock: 8,
    category: 'Pinturas',
  },
  {
    id: 'p5',
    name: 'Set de Pinceles Profesionales (6 unidades)',
    price: 4200,
    type: 'simple',
    stock: 30,
    minStock: 5,
    category: 'Accesorios',
  },
  {
    id: 'p6',
    name: 'Esponjas de Alta Densidad para Difuminado (3u)',
    price: 1200,
    type: 'simple',
    stock: 4, // Below Minimum! (minStock is 10)
    minStock: 10,
    category: 'Accesorios',
  },
  {
    id: 'p7',
    name: 'Fijador de Maquillaje Spray - Larga Duración (150ml)',
    price: 3100,
    type: 'simple',
    stock: 18,
    minStock: 6,
    category: 'Fijadores',
  },
  // Kits (Kits are composed of other products/kits, but have a custom defined price independent of parts)
  {
    id: 'k1',
    name: 'Kit Fiesta Neón Ultra',
    price: 4900, // Cheaper than buying components separately
    type: 'kit',
    stock: 12,
    minStock: 5,
    category: 'Kits',
    components: [
      { productId: 'p1', name: 'Pintura Corporal Fluo - Neón Amarillo (100ml)', quantity: 2 },
      { productId: 'p2', name: 'Pintura Corporal Fluo - Neón Rosa (100ml)', quantity: 2 },
      { productId: 'p6', name: 'Esponjas de Alta Densidad para Difuminado (3u)', quantity: 1 },
    ],
  },
  {
    id: 'k2',
    name: 'Kit Arte Metálico Premium',
    price: 8500,
    type: 'kit',
    stock: 3, // Near Minimum!
    minStock: 5,
    category: 'Kits',
    components: [
      { productId: 'p3', name: 'Pintura Corporal Metalizada - Oro Imperial (120ml)', quantity: 2 },
      { productId: 'p4', name: 'Pintura Corporal Metalizada - Plata Fina (120ml)', quantity: 2 },
      { productId: 'p5', name: 'Set de Pinceles Profesionales (6 unidades)', quantity: 1 },
    ],
  },
  {
    id: 'k3',
    name: 'Mega Kit Body Painting Profesional',
    price: 14500,
    type: 'kit',
    stock: 15,
    minStock: 3,
    category: 'Kits',
    components: [
      { productId: 'p1', name: 'Pintura Corporal Fluo - Neón Amarillo (100ml)', quantity: 2 },
      { productId: 'p2', name: 'Pintura Corporal Fluo - Neón Rosa (100ml)', quantity: 2 },
      { productId: 'p3', name: 'Pintura Corporal Metalizada - Oro Imperial (120ml)', quantity: 1 },
      { productId: 'p4', name: 'Pintura Corporal Metalizada - Plata Fina (120ml)', quantity: 1 },
      { productId: 'p5', name: 'Set de Pinceles Profesionales (6 unidades)', quantity: 1 },
      { productId: 'p7', name: 'Fijador de Maquillaje Spray - Larga Duración (150ml)', quantity: 1 },
    ],
  }
];

// Initial Clients
export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Sofía Rodríguez',
    email: 'sofia.rodriguez@gmail.com',
    region: 'CABA - Buenos Aires',
    address: 'Av. Corrientes 1420, Piso 3B',
  },
  {
    id: 'c2',
    name: 'Mateo González',
    email: 'mateo.gonzalez@hotmail.com',
    region: 'Zona Norte - San Isidro',
    address: 'Chacabuco 822',
  },
  {
    id: 'c3',
    name: 'Valentina Martínez',
    email: 'valen_makeup@gmail.com',
    region: 'Zona Oeste - Ramos Mejía',
    address: 'Rosales 340',
  },
  {
    id: 'c4',
    name: 'Bautista Silva',
    email: 'bauti.silva@yahoo.com.ar',
    region: 'Zona Sur - Lanús',
    address: 'Margarita Weild 1850',
  },
  {
    id: 'c5',
    name: 'Camila Díaz',
    email: 'camila.artist@outlook.com',
    region: 'CABA - Buenos Aires',
    address: 'Aristóbulo del Valle 415',
  },
  {
    id: 'c6',
    name: 'Joaquín Gómez',
    email: 'joaco.makeup@gmail.com',
    region: 'Santa Fe (Rosario)',
    address: 'Pellegrini 1540',
  },
  {
    id: 'c7',
    name: 'Martina Benítez',
    email: 'martina.benitez99@gmail.com',
    region: 'Córdoba Capital',
    address: 'Av. Colón 430',
  },
  {
    id: 'c8',
    name: 'Lucas Castro',
    email: 'lucas_castro@gmail.com',
    region: 'Zona Norte - Vicente López',
    address: 'Av. Maipú 2100',
  },
  {
    id: 'c9',
    name: 'Isabella Peralta',
    email: 'isa.peralta@gmail.com',
    region: 'Mendoza (Capital)',
    address: 'San Martín 940',
  },
  {
    id: 'c10',
    name: 'Tomás Romero',
    email: 'tomas.romero@hotmail.com',
    region: 'Zona Oeste - Morón',
    address: 'San Martín 154',
  },
  {
    id: 'c11',
    name: 'Elena Funes',
    email: 'elena.makeup22@gmail.com',
    region: 'CABA - Buenos Aires',
    address: 'Juramento 2445',
  }
];

// Initial Coupons
export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup1',
    code: 'NEONSTRIKE',
    discountAmount: 1500,
    validityStart: '2026-05-01',
    validityEnd: '2026-07-31',
    applicableProductIds: ['p1', 'p2', 'k1'], // neon-focused
    assignedClientIds: ['c1', 'c2', 'c3'],
    usedByClientIds: ['c2'], // Mateo used it
    active: true,
  },
  {
    id: 'coup2',
    code: 'ARTEMETAL',
    discountAmount: 2000,
    validityStart: '2026-05-15',
    validityEnd: '2026-06-30',
    applicableProductIds: ['p3', 'p4', 'k2'], // metallic-focused
    assignedClientIds: ['c3', 'c5'],
    usedByClientIds: [],
    active: true,
  },
  {
    id: 'coup3',
    code: 'PROBIENVENIDA',
    discountAmount: 1000,
    validityStart: '2026-01-01',
    validityEnd: '2026-12-31',
    applicableProductIds: [], // applicable to any product
    assignedClientIds: ['c1', 'c4', 'c6', 'c7'],
    usedByClientIds: ['c1', 'c7'],
    active: true,
  }
];

// Initial Sales History (25 orders to populate top tier dashboards instantly)
export const INITIAL_ORDERS: Order[] = [
  // CABA Orders
  {
    id: 'order1',
    clientId: 'c1',
    clientName: 'Sofía Rodríguez',
    clientEmail: 'sofia.rodriguez@gmail.com',
    date: '2026-04-10',
    items: [
      { productId: 'k3', productName: 'Mega Kit Body Painting Profesional', quantity: 1, unitPrice: 14500 },
    ],
    subtotal: 14500,
    couponCode: 'PROBIENVENIDA',
    discountApplied: 1000,
    total: 13500,
    status: 'paid',
    deliveryAddress: 'Av. Corrientes 1420, Piso 3B',
    region: 'CABA - Buenos Aires',
    trackingNumber: 'BP-TRK-74839',
  },
  {
    id: 'order2',
    clientId: 'c1',
    clientName: 'Sofía Rodríguez',
    clientEmail: 'sofia.rodriguez@gmail.com',
    date: '2026-05-20',
    items: [
      { productId: 'p1', productName: 'Pintura Corporal Fluo - Neón Amarillo (100ml)', quantity: 3, unitPrice: 1800 },
      { productId: 'p5', productName: 'Set de Pinceles Profesionales (6 unidades)', quantity: 1, unitPrice: 4200 },
    ],
    subtotal: 9600,
    discountApplied: 0,
    total: 9600,
    status: 'paid',
    deliveryAddress: 'Av. Corrientes 1420, Piso 3B',
    region: 'CABA - Buenos Aires',
    trackingNumber: 'BP-TRK-90123',
  },
  // Zona Norte Orders
  {
    id: 'order3',
    clientId: 'c2',
    clientName: 'Mateo González',
    clientEmail: 'mateo.gonzalez@hotmail.com',
    date: '2026-05-02',
    items: [
      { productId: 'k1', productName: 'Kit Fiesta Neón Ultra', quantity: 2, unitPrice: 4900 },
    ],
    subtotal: 9800,
    couponCode: 'NEONSTRIKE',
    discountApplied: 1500,
    total: 8300,
    status: 'paid',
    deliveryAddress: 'Chacabuco 822',
    region: 'Zona Norte - San Isidro',
    trackingNumber: 'BP-TRK-12345',
  },
  {
    id: 'order4',
    clientId: 'c8',
    clientName: 'Lucas Castro',
    clientEmail: 'lucas_castro@gmail.com',
    date: '2026-05-15',
    items: [
      { productId: 'k3', productName: 'Mega Kit Body Painting Profesional', quantity: 1, unitPrice: 14500 },
      { productId: 'p7', productName: 'Fijador de Maquillaje Spray - Larga Duración (150ml)', quantity: 2, unitPrice: 3100 },
    ],
    subtotal: 20700,
    discountApplied: 0,
    total: 20700,
    status: 'paid',
    deliveryAddress: 'Av. Maipú 2100',
    region: 'Zona Norte - Vicente López',
    trackingNumber: 'BP-TRK-55234',
  },
  // Zona Oeste
  {
    id: 'order5',
    clientId: 'c3',
    clientName: 'Valentina Martínez',
    clientEmail: 'valen_makeup@gmail.com',
    date: '2026-04-18',
    items: [
      { productId: 'p3', productName: 'Pintura Corporal Metalizada - Oro Imperial (120ml)', quantity: 4, unitPrice: 2500 },
    ],
    subtotal: 10000,
    discountApplied: 0,
    total: 10000,
    status: 'paid',
    deliveryAddress: 'Rosales 340',
    region: 'Zona Oeste - Ramos Mejía',
    trackingNumber: 'BP-TRK-99012',
  },
  {
    id: 'order6',
    clientId: 'c10',
    clientName: 'Tomás Romero',
    clientEmail: 'tomas.romero@hotmail.com',
    date: '2026-05-28',
    items: [
      { productId: 'p1', productName: 'Pintura Corporal Fluo - Neón Amarillo (100ml)', quantity: 5, unitPrice: 1800 },
      { productId: 'p2', productName: 'Pintura Corporal Fluo - Neón Rosa (100ml)', quantity: 5, unitPrice: 1800 },
    ],
    subtotal: 18000,
    discountApplied: 0,
    total: 18000,
    status: 'paid',
    deliveryAddress: 'San Martín 154',
    region: 'Zona Oeste - Morón',
    trackingNumber: 'BP-TRK-77114',
  },
  // Zona Sur
  {
    id: 'order7',
    clientId: 'c4',
    clientName: 'Bautista Silva',
    clientEmail: 'bauti.silva@yahoo.com.ar',
    date: '2026-04-20',
    items: [
      { productId: 'p5', productName: 'Set de Pinceles Profesionales (6 unidades)', quantity: 2, unitPrice: 4200 },
      { productId: 'p6', productName: 'Esponjas de Alta Densidad para Difuminado (3u)', quantity: 3, unitPrice: 1200 },
    ],
    subtotal: 12000,
    discountApplied: 0,
    total: 12000,
    status: 'paid',
    deliveryAddress: 'Margarita Weild 1850',
    region: 'Zona Sur - Lanús',
    trackingNumber: 'BP-TRK-34125',
  },
  // Cordoba
  {
    id: 'order8',
    clientId: 'c7',
    clientName: 'Martina Benítez',
    clientEmail: 'martina.benitez99@gmail.com',
    date: '2026-05-10',
    items: [
      { productId: 'k2', productName: 'Kit Arte Metálico Premium', quantity: 2, unitPrice: 8500 },
    ],
    subtotal: 17000,
    couponCode: 'PROBIENVENIDA',
    discountApplied: 1000,
    total: 16000,
    status: 'paid',
    deliveryAddress: 'Av. Colón 430',
    region: 'Córdoba Capital',
    trackingNumber: 'BP-TRK-58293',
  },
  // Santa Fe / Rosario
  {
    id: 'order9',
    clientId: 'c6',
    clientName: 'Joaquín Gómez',
    clientEmail: 'joaco.makeup@gmail.com',
    date: '2026-05-12',
    items: [
      { productId: 'p3', productName: 'Pintura Corporal Metalizada - Oro Imperial (120ml)', quantity: 2, unitPrice: 2500 },
      { productId: 'p4', productName: 'Pintura Corporal Metalizada - Plata Fina (120ml)', quantity: 2, unitPrice: 2500 },
      { productId: 'k1', productName: 'Kit Fiesta Neón Ultra', quantity: 1, unitPrice: 4900 },
    ],
    subtotal: 14900,
    discountApplied: 0,
    total: 14900,
    status: 'paid',
    deliveryAddress: 'Pellegrini 1540',
    region: 'Santa Fe (Rosario)',
    trackingNumber: 'BP-TRK-10928',
  },
  // Mendoza
  {
    id: 'order10',
    clientId: 'c9',
    clientName: 'Isabella Peralta',
    clientEmail: 'isa.peralta@gmail.com',
    date: '2026-05-14',
    items: [
      { productId: 'k3', productName: 'Mega Kit Body Painting Profesional', quantity: 1, unitPrice: 14500 },
    ],
    subtotal: 14500,
    discountApplied: 0,
    total: 14500,
    status: 'paid',
    deliveryAddress: 'San Martín 940',
    region: 'Mendoza (Capital)',
    trackingNumber: 'BP-TRK-12001',
  }
];
