import { db } from '../src/db/client';
import { products, type NewProduct } from '../src/db/schema';
import { sql } from 'drizzle-orm';

const seedProducts: NewProduct[] = [
  {
    productId: 'KETTLE',
    domain: 'Home & Kitchen',
    asin: 'B0BV6BGYT5',
    title: 'Hamilton Beach Electric Tea Kettle',
    price: '30.13',
    priceSource: 'Amazon.com',
    imageUrl: '/kettle.jpg',
    bulletPointsSource: 'Amazon.com',
    bulletPoints: [
      { label: 'Brand', value: 'Hamilton Beach' },
      { label: 'Colour', value: 'Silver' },
      { label: 'Capacity', value: '1.7 Liters' },
      { label: 'Material', value: 'Stainless Steel' },
    ],
    aboutItemSource: 'Amazon.com',
    aboutItem: [
      'FAST BOILING WITH 1500 WATTS: This electric kettle boils up to 1.7 liters of water faster than a microwave and safer than a stovetop kettle. Make a quick cup of tea, coffee and more without the long wait — perfect for hectic mornings.',
      'PEACE OF MIND WITH AUTO SHUTOFF: The automatic shutoff feature with boil-dry protection keeps the Hamilton Beach electric kettle from scorching if the water level gets too low.',
      'POWER INDICATOR LIGHT AND SIMPLE ON/OFF SWITCH: With an attractive blue power light on the front and a simple on/off switch on the back, this cordless electric kettle lets you easily boil and reheat water without any fuss.',
      'DURABLE STAINLESS STEEL WITH BPA-FREE INTERIOR: Designed for years of reliable, worry-free performance and long-lasting style in every kitchen.',
    ]
  },
  {
    productId: 'SWEATSHIRT',
    domain: 'Clothing',
    asin: 'B00JULWJLI',
    title: "Hanes Men's Ultimate Cotton Heavyweight Crewneck Sweatshirt",
    price: '21.91',
    priceSource: 'Amazon.com',
    imageUrl: '/sweatshirt.avif',
    bulletPointsSource: 'Amazon.com',
    bulletPoints: [
      { label: 'Brand', value: 'Hanes' },
      { label: 'Colour', value: 'Black' },
      { label: 'Fabric type', value: '90% Cotton, 10% Polyester' },
      { label: 'Care instructions', value: 'Machine Wash' },
    ],
    aboutItemSource: 'Reviews23',
    aboutItem: [
      "A HEAVYWEIGHT CHAMPION: Hanes sweatshirts for men are made from soft, plush, 9.7-oz. heavyweight fleece for cozy warmth.",
      "THE FIT YOU LOVE: These men’s workout sweatshirt boast a standard fit with dropped shoulders for a little extra room.",
      "QUALITY FABRIC: The heavyweight cotton-rich fleece is made with Hanes' patented anti-pill technique and features a high-density stitch count.",
      "COLD WATER WASH: Machine wash cold with like colors. Use only nonchlorine bleach when needed. Tumble dry low. Cool iron if needed."
    ]
  },
  {
    productId: 'EARBUDS',
    domain: 'Electronics',
    asin: 'B097MRW46F',
    title: 'Soundcore by Anker Life P3 Noise Cancelling Earbuds',
    price: '60.30',
    priceSource: 'berechnet aus Reviews23',
    imageUrl: '/earbuds.avif',
    bulletPointsSource: 'Amazon.com',
    bulletPoints: [
      { label: 'Brand', value: 'soundcore' },
      { label: 'Colour', value: 'black' },
      { label: 'Form factor', value: 'In Ear' },
      { label: 'Connectivity technology', value: 'Wireless' }
    ],
    aboutItemSource: 'Amazon.com',
    aboutItem: [
      "THE RAINBOW IN MINI FORMAT: The Life P3 Earbuds are available in 5 stylish colours and the compact design of the charging case fits perfectly in any pocket. Ideal for on the go.",
      "MORE BASS: Our exclusive BassUp technology analyses the sound profile in real time and automatically boosts low frequencies many times over. Hear more - feel more.",
      "MULTI-MODE NOISE CANCELLATION: Choose the right mode from transport, outdoor and indoor and immerse yourself in the ultimate sound experience.",
      "FIRST CLASS CALL QUALITY: Your earbuds are equipped with 6 microphones, which, thanks to smart noise cancellation, provide isolated background noise and thus crystal clear phone calls."
    ]
  }
];

async function seed() {
  console.log('Upserting products...');
  for (const product of seedProducts) {
    await db.insert(products)
      .values(product)
      .onConflictDoUpdate({
        target: products.productId,
        set: {
          domain: product.domain,
          asin: product.asin,
          title: product.title,
          price: product.price,
          priceSource: product.priceSource,
          averageRating: product.averageRating,
          reviewCount: product.reviewCount,
          imageUrl: product.imageUrl,
          bulletPointsSource: product.bulletPointsSource,
          bulletPoints: product.bulletPoints,
          aboutItemSource: product.aboutItemSource,
          aboutItem: product.aboutItem,
        }
      });
  }
  console.log('✅ Seeded 3 products');
}

seed();