// Development API endpoint for orders
// This file serves as a mock API for development mode

const orders = [
  {
    id: 1,
    order_id: 'ORD001',
    items: [
      { name: 'ชาไทยเย็น', price: 25, quantity: 2 }
    ],
    total: 50,
    created_at: new Date().toISOString()
  }
];

// Export for development use
export default orders;
