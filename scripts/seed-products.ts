import { db } from '../src/db/client';
import { products } from '../src/db/schema';

const seedProducts = [
  {
    domain: 'Electronics',
    asin: 'B0TEST001',
    title: 'Premium Wireless Headphones with Noise Cancellation',
    price: '99.99',
    averageRating: '4.3',
    reviewCount: 250,
    imageUrl: '<https://placeholder.com/headphones.jpg>',
  },
  {
    domain: 'Home & Kitchen',
    asin: 'B0TEST002',
    title: 'Stainless Steel Electric Kettle 1.7L',
    price: '34.99',
    averageRating: '4.5',
    reviewCount: 180,
    imageUrl: '<https://placeholder.com/kettle.jpg>',
  },
  {
    domain: 'Clothing',
    asin: 'B0TEST003',
    title: 'Cotton Crew Neck T-Shirt',
    price: '19.99',
    averageRating: '4.1',
    reviewCount: 320,
    imageUrl: '<https://placeholder.com/tshirt.jpg>',
  },
];

async function seed() {
  await db.insert(products).values(seedProducts);
  console.log('✅ Seeded 3 products');
}

seed();