// Mock API service for products and categories

export async function fetchTopCategories() {
  return [
    { id: 1, name: 'Mobiles', slug: 'mobiles' },
    { id: 2, name: 'Laptops', slug: 'laptops' },
    { id: 3, name: 'Electronics', slug: 'electronics' },
    { id: 4, name: 'Fashion', slug: 'fashion' },
    { id: 5, name: 'Home & Kitchen', slug: 'home-kitchen' },
    { id: 6, name: 'Beauty', slug: 'beauty' },
    { id: 7, name: 'Footwear', slug: 'footwear' },
    { id: 8, name: 'Bags & Luggage', slug: 'bags-luggage' },
  ];
}

export async function fetchHeroOffers() {
  return {
    title: 'Discover. Shop. Save More.',
    discountText: 'UP TO 60% OFF',
    subtitle: 'Top brands, best prices and exclusive offers on everything you love.',
  };
}
