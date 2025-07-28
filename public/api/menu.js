// Development API endpoint for menu
// This file serves as a mock API for development mode

const menuItems = [
  {
    id: 1,
    name: 'ชาไทยเย็น',
    price: 25,
    cost: 15,
    category: 'ชาไทย',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'ชาไทยร้อน',
    price: 20,
    cost: 12,
    category: 'ชาไทย',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'ชาเขียวเย็น',
    price: 30,
    cost: 18,
    category: 'ชาเขียว',
    created_at: new Date().toISOString()
  }
];

// Export for development use
export default menuItems;
