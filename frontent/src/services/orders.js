export const createOrderPreview = (cartItems, customer, deliveryAddress) => ({
  id: `OK-${Math.floor(100000 + Math.random() * 900000)}`,
  items: cartItems,
  customer,
  deliveryAddress,
  status: 'Confirmed',
  createdAt: new Date().toISOString()
});
