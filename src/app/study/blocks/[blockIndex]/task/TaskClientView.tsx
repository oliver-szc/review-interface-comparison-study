'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StudyLayout } from '@/components/layouts/StudyLayout';
import { WebshopLayout } from '@/components/layouts/WebshopLayout';
import { AriaInvalidSync } from '@/components/forms/AriaInvalidSync';
import { ProductImage, ProductDetails } from '@/components/ui/ProductPanel';
import { ReviewListPanel } from '@/components/ui/ReviewListPanel';
import { ChatbotPanel } from '@/components/interfaces/chatbot/ChatbotPanel';
import { DashboardPanel } from '@/components/interfaces/dashboard/DashboardPanel';
import earbudsImage from '@/app/earbuds.jpg';

interface Claim {
  id: string;
  claimOrder: number;
  claimText: string;
}

interface TaskClientViewProps {
  blockIndex: number;
  conditionType: 'BASELINE' | 'DASHBOARD' | 'CHATBOT';
  productId: 'EARBUDS' | 'KETTLE' | 'SWEATSHIRT';
  claims: Claim[];
  productData: any;
}

// ─── Shared review data (placeholder until real product data is seeded) ───────
const SHARED_REVIEWS = [
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
];

const SHARED_STAR_DISTRIBUTION = [
  { stars: 5, count: 1823 },
  { stars: 4, count: 654 },
  { stars: 3, count: 234 },
  { stars: 2, count: 89 },
  { stars: 1, count: 47 },
];

// Removed hardcoded PRODUCT_DATA_MAP

export default function TaskClientView({ blockIndex, conditionType, productId, claims, productData }: TaskClientViewProps) {
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    setStartTime(performance.now());
  }, []);

  const schemaShape: Record<string, z.ZodString> = {};
  claims.forEach((claim) => {
    schemaShape[claim.id] = z.string({
      message: 'Please answer this question.',
    }).min(1, 'Please answer this question.');
  });
  const TaskSchema = z.object(schemaShape);
  type TaskFormData = z.infer<typeof TaskSchema>;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(TaskSchema),
    mode: 'onSubmit',
  });

  const { register, formState: { errors } } = form;

  const onSubmit = async (data: TaskFormData) => {
    if (!startTime) return;
    const endTime = performance.now();
    const timeOnTaskMs = Math.round(endTime - startTime);

    try {
      const payload = {
        answers: data,
        timeOnTaskMs,
        taskStartTime: Date.now() - timeOnTaskMs,
        taskEndTime: Date.now(),
        conditionType,
        productId,
      };

      const response = await fetch(`/api/study/blocks/${blockIndex}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      if (result.redirectUrl) {
        window.location.replace(result.redirectUrl);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while submitting. Please try again.');
    }
  };

  const uiProductData = {
    ...productData,
    avgRating: Number(productData.averageRating || 0),
    totalReviews: productData.reviewCount || 0,
    image: productData.imageUrl || earbudsImage,
  };
  const conditionLabel =
    conditionType === 'CHATBOT' ? 'AI Chatbot' :
      conditionType === 'DASHBOARD' ? 'Interactive Dashboard' :
        'Reviews Only';

  const taskNode = ({ isOpen }: { isOpen: boolean }) => (
    <div className="flex flex-col items-center">
      <p className="font-bold text-slate-950 text-sm whitespace-nowrap mb-1">
        Task {blockIndex}/3 · {conditionLabel}
      </p>
      {!isOpen && (
        <div className="flex flex-col items-center gap-0.5 mt-1">
          {claims.map((claim) => (
            <p key={claim.id} className="text-slate-600 text-sm font-normal italic whitespace-nowrap leading-relaxed">
              “{claim.claimText}”
            </p>
          ))}
        </div>
      )}
    </div>
  );

  const submitFormNode = (
    <div className="w-full max-w-4xl flex flex-col gap-6 text-left">
      <p className="text-slate-700 text-sm md:text-base leading-relaxed">
        You are interested in buying this {productId.toLowerCase()} and want to find out if the claims you heard about it are actually true. Please use the provided system to verify the three following claims:
      </p>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="w-full flex flex-col gap-6"
      >
        <AriaInvalidSync />

        {/* Dynamic Table-wise claims build */}
        <div className="w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xxs-11 font-semibold text-slate-900">
                <th scope="col" className="px-6 py-3.5 font-bold">Claim</th>
                <th scope="col" className="px-4 py-3.5 text-center font-bold w-24">True</th>
                <th scope="col" className="px-4 py-3.5 text-center font-bold w-24">False</th>
                <th scope="col" className="px-4 py-3.5 text-center font-bold w-48">Not mentioned in reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {claims.map((claim) => {
                const registration = register(claim.id);
                const { ref: formRef, ...restRegistration } = registration;
                const hasError = !!errors[claim.id];

                return (
                  <tr
                    key={claim.id}
                    className={`hover:bg-slate-50/20 transition-colors ${hasError ? 'bg-red-50/20 hover:bg-red-50/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 italic leading-relaxed text-xs md:text-sm block">
                        “{claim.claimText}”
                      </span>
                      {hasError && (
                        <span role="alert" className="mt-1.5 text-xxs-11 text-red-600 font-medium flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          <span>{errors[claim.id]?.message as string}</span>
                        </span>
                      )}
                    </td>
                    {[
                      { value: '1' },
                      { value: '2' },
                      { value: '3' },
                    ].map((option) => {
                      const inputId = `${claim.id}-${option.value}`;
                      return (
                        <td key={option.value} className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <label
                              htmlFor={inputId}
                              className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer hover:bg-slate-50 transition-colors active:scale-95 focus-within:ring-2 focus-within:ring-slate-300"
                            >
                              <input
                                id={inputId}
                                type="radio"
                                value={option.value}
                                {...restRegistration}
                                ref={(e) => {
                                  formRef(e);
                                }}
                                className="h-4 w-4 shrink-0 rounded-full border-slate-300 text-sky-600 focus:ring-sky-600 cursor-pointer"
                              />
                            </label>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Form Action Submit Button */}
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
          >
            {form.formState.isSubmitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <StudyLayout
      task={taskNode}
      submitContent={submitFormNode}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <WebshopLayout
        condition={conditionType.toLowerCase() as 'unassisted' | 'dashboard' | 'chatbot'}
        productImage={<ProductImage productData={uiProductData as any} />}
        topContent={<ProductDetails productData={uiProductData as any} />}
        leftContent={conditionType === 'CHATBOT' ? <ChatbotPanel /> : null}
        middleContent={
          <div className="space-y-3">
            {/* Dashboard panel shown above reviews for DASHBOARD condition */}
            {conditionType === 'DASHBOARD' && <DashboardPanel />}

            {/* Review list (shown for all conditions; rendered underneath the dashboard for DASHBOARD condition) */}
            <ReviewListPanel
              reviews={SHARED_REVIEWS}
              starDistribution={SHARED_STAR_DISTRIBUTION}
              averageRating={uiProductData.avgRating}
              totalCount={uiProductData.totalReviews}
            />
          </div>
        }
      />
    </StudyLayout>
  );
}

