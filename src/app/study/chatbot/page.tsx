'use client'

import { StudyLayout } from '@/components/layouts/StudyLayout'
import { WebshopLayout } from '@/components/layouts/WebshopLayout'
import { ProductPanel } from '@/components/ui/ProductPanel'
import { ReviewListPanel } from '@/components/ui/ReviewListPanel'
import { ChatbotPanel } from '@/components/interfaces/chatbot/ChatbotPanel'
import earbudsImage from '@/app/earbuds.jpg'

export default function ChatbotPage() {
  // Mock data - same as unassisted
  const productData = {
    title: 'Premium Wireless Earbuds with Active Noise Cancellation',
    image: earbudsImage,
    avgRating: 4.3,
    totalReviews: 2847,
    bullets: [
      'Advanced Active Noise Cancellation technology',
      'Up to 30 hours of battery life with charging case',
      'IPX7 waterproof rating for workouts and rain',
      'Premium sound quality with custom-tuned drivers',
      'Comfortable ergonomic design with multiple ear tip sizes',
    ],
    specs: [
      {
        label: 'Sound quality',
        description:
          'Experience rich, high-fidelity sound with deep bass and clear highs.',
      },
      {
        label: 'Noise cancellation',
        description:
          'Industry-leading noise cancellation blocks out ambient sounds for immersive listening.',
      },
      {
        label: 'Build quality',
        description:
          'Durable construction with premium materials designed to last.',
      },
      {
        label: 'Battery life',
        description:
          'Extended playback time with quick-charge support for on-the-go use.',
      },
      {
        label: 'Price',
        description: 'Competitive pricing with excellent value for features offered.',
      },
    ],
  }

  const reviews = [
    {
      name: 'Sarah M.',
      stars: 5,
      date: 'January 15, 2024',
      text: 'Absolutely love these earbuds! The sound quality is incredible and the noise cancellation works perfectly. I use them daily for my commute and they block out all the train noise. Battery life is exactly as advertised.',
    },
    {
      name: 'James T.',
      stars: 4,
      date: 'January 12, 2024',
      text: 'Great earbuds overall. Sound is crisp and clear, bass is punchy without being overwhelming. Only complaint is that they occasionally disconnect when my phone is in my pocket, but this is rare.',
    },
    {
      name: 'Maria G.',
      stars: 5,
      date: 'January 10, 2024',
      text: 'Best purchase I made this year. The fit is perfect, they never fall out even during workouts. The touch controls are intuitive and the app gives you lots of customization options. Highly recommend!',
    },
    {
      name: 'David L.',
      stars: 3,
      date: 'January 8, 2024',
      text: "They're okay but not amazing. Sound quality is good for the price but I expected better noise cancellation. The battery life is solid though and they're comfortable for long listening sessions.",
    },
    {
      name: 'Emily R.',
      stars: 5,
      date: 'January 5, 2024',
      text: 'These replaced my AirPods Pro and I actually like them better! The noise cancellation is on par and the sound quality is richer. The case is a bit bulky but the battery life makes up for it.',
    },
  ]

  const starDistribution = [
    { stars: 5, count: 1823 },
    { stars: 4, count: 654 },
    { stars: 3, count: 234 },
    { stars: 2, count: 89 },
    { stars: 1, count: 47 },
  ]

  return (
    <StudyLayout task="Ask the AI assistant to help you identify the three most frequently mentioned positive aspects of this product.">
      <WebshopLayout
        topContent={<ProductPanel productData={productData} />}
        leftContent={<ChatbotPanel />}
        middleContent={
          <>
            <ReviewListPanel
              reviews={reviews}
              starDistribution={starDistribution}
              averageRating={productData.avgRating}
              totalCount={productData.totalReviews}
            />
          </>
        }
      />
    </StudyLayout>
  )
}
