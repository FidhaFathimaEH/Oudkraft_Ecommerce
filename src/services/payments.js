export const paymentMethods = [
  { id: 'card', label: 'Credit / Debit Card', description: 'Connected to a future UAE gateway.' },
  { id: 'cod', label: 'Cash on Delivery', description: 'Available for Abu Dhabi and select emirates.' }
];

export const submitPayment = async (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ status: 'ready', payload }), 400);
  });
};
