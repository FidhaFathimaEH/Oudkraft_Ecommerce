export const businessConfig = {
  brandName: 'OUD KRAFT',
  phone: '+971 50 983 4317',
  whatsapp:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_NUMBER) || '971509834317',
  email: 'hello@oudkraft.ae',
  instagram: '@oud_kraft',
  currency: 'AED',
  location: 'Abu Dhabi, UAE',
  heroTitle: 'LUXURY PERFUMES, CURATED IN THE CAPITAL',
  heroSubtitle: 'Signature oud and modern florals for unforgettable moments',
  heroDescription: 'From resin-rich oud to luminous citrus accords, discover refined fragrances crafted for celebration, gifting and everyday indulgence in Abu Dhabi.'
};

export const deliveryConfig = {
  abuDhabiFee: 20,
  freeDeliveryThreshold: 250,
  otherEmiratesFee: 35,
  supportedEmirates: [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah'
  ]
};
