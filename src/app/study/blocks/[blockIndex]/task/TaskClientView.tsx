'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StudyLayout } from '@/components/layouts/StudyLayout';
import { WebshopLayout } from '@/components/layouts/WebshopLayout';
import { AriaInvalidSync } from '@/components/forms/AriaInvalidSync';
import { ProductPanel } from '@/components/ui/ProductPanel';
import { ReviewListPanel } from '@/components/ui/ReviewListPanel';
import { ChatbotPanel } from '@/components/interfaces/chatbot/ChatbotPanel'; // Touch for final scroll timing rebuild
import { DashboardPanel } from '@/components/interfaces/dashboard/DashboardPanel';
import { useTutorial } from '@/lib/contexts/TutorialContext';
import { TutorialHighlight } from '@/components/tutorial/TutorialHighlight';
import type { AspectStat } from '@/lib/queries/absa';

interface Claim {
  id: string;
  claimOrder: number;
  claimText: string;
}

interface TaskClientViewProps {
  blockIndex: number;
  conditionType: 'BASELINE' | 'DASHBOARD' | 'CHATBOT' | 'TUTORIAL';
  productId: 'EARBUDS' | 'KETTLE' | 'SWEATSHIRT' | 'TUTORIAL';
  claims: Claim[];
  productData: any;
  reviews: any[];
  starDistribution: any[];
  aspectData?: AspectStat[];
  onTutorialSubmit?: () => void;
}

// Removed hardcoded PRODUCT_DATA_MAP

function formatClaimText(text: string) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function TaskClientView({ blockIndex, conditionType, productId, claims, productData, reviews, starDistribution, aspectData = [], onTutorialSubmit }: TaskClientViewProps) {
  const { currentStep, waitingForAction, dispatchTutorialAction } = useTutorial();
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

  const { register, formState: { errors }, watch } = form;

  const formValues = watch();

  useEffect(() => {
    if (conditionType === 'TUTORIAL') {
      if (claims.length > 0 && formValues[claims[0].id] === '1') {
        dispatchTutorialAction('FIRST_CLAIM_TRUE');
      }
      const allCompletedCorrectly = claims.length >= 3 &&
        formValues[claims[0].id] === '1' &&
        formValues[claims[1].id] === '2' &&
        formValues[claims[2].id] === '2';

      if (allCompletedCorrectly) {
        dispatchTutorialAction('ALL_CLAIMS_TRUE');
      }
    }
  }, [formValues, claims, conditionType, dispatchTutorialAction]);

  const onSubmit = async (data: TaskFormData) => {
    if (!startTime) return;
    const endTime = performance.now();
    const timeOnTaskMs = Math.round(endTime - startTime);

    if (onTutorialSubmit) {
      onTutorialSubmit();
      return;
    }

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

  const calculatedTotalReviews = reviews.length;
  const calculatedAvgRating = calculatedTotalReviews > 0
    ? reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / calculatedTotalReviews
    : 0;

  const computedStarDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.stars === stars).length
  }));

  const uiProductData = {
    ...productData,
    avgRating: calculatedAvgRating,
    totalReviews: calculatedTotalReviews,
    image: productData.imageUrl || '/earbuds.avif',
  };
  const conditionLabel =
    conditionType === 'TUTORIAL' ? 'Tutorial' :
      conditionType === 'CHATBOT' ? 'Chatbot' :
        conditionType === 'DASHBOARD' ? 'Dashboard' :
          'Reviews Only';

  const taskNode = ({ isOpen }: { isOpen: boolean }) => (
    <div className="flex flex-col items-center">
      <p className="font-bold text-slate-950 text-sm whitespace-nowrap mb-1">
        {conditionType === 'TUTORIAL' ? conditionLabel : `Task ${blockIndex}/3 · ${conditionLabel}`}
      </p>
      <div
        className={`flex flex-col items-center gap-0.5 mt-1 transition-all duration-300 ${isOpen ? 'hidden opacity-0 pointer-events-none' : 'visible opacity-100'
          }`}
      >
        {claims.map((claim, index) => (
          <p key={claim.id} className="text-slate-600 text-sm font-normal italic whitespace-nowrap leading-relaxed">
            Claim {index + 1}: “{formatClaimText(claim.claimText)}”
          </p>
        ))}
      </div>
    </div>
  );

  let conditionDisplay = "review section";
  if (conditionType === 'TUTORIAL') {
    conditionDisplay = "dashboard, chatbot, and review section";
  } else if (conditionType === 'CHATBOT') {
    conditionDisplay = "chatbot";
  } else if (conditionType === 'DASHBOARD') {
    conditionDisplay = "dashboard";
  }

  const submitFormNode = (
    <div className="w-full max-w-4xl flex flex-col gap-6 text-left">
      <p className="text-slate-700 text-sm md:text-base leading-relaxed">
        Please use the {' '}
        {conditionType === 'CHATBOT' || conditionType === 'DASHBOARD' ? (
          <span className="rounded-md ml-0.5 mr-0.5 px-1 border-2 border-sky-400 font-semibold">{conditionDisplay}</span>
        ) : conditionType === 'TUTORIAL' ? (
          <span className="font-semibold">system</span>
        ) : (
          <span className="font-semibold">{conditionDisplay}</span>
        )} to explore the reviews and determine whether the claim is supported by customer feedback.
        Mark a claim as <span className="font-semibold">True</span> if the majority confirms it, <span className="font-semibold">False</span> if the majority contradicts it, or <span className="font-semibold">Not mentioned</span> if the reviews simply don't address it.
      </p>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="w-full flex flex-col gap-6"
      >
        <AriaInvalidSync />

        {/* Dynamic Table-wise claims build */}
        {/* Dynamic Table-wise claims build */}
        <div className="w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm relative">
          <table className="w-full border-collapse text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xxs-11 font-semibold text-slate-900">
                <th scope="col" className="px-6 py-3.5 font-bold">Claim</th>
                <th scope="col" className="px-4 py-3.5 text-center font-bold w-24">True</th>
                <th scope="col" className="px-4 py-3.5 text-center font-bold w-24">False</th>
                <th scope="col" className="px-4 py-3.5 text-center font-bold w-48">Not mentioned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {claims.map((claim, idx) => {
                const registration = register(claim.id);
                const { ref: formRef, ...restRegistration } = registration;
                const hasError = !!errors[claim.id];

                let isCorrect = false;
                if (conditionType === 'TUTORIAL') {
                  if (idx === 0) isCorrect = formValues[claim.id] === '1';
                  else if (idx === 1 || idx === 2) isCorrect = formValues[claim.id] === '2';
                } else {
                  isCorrect = formValues[claim.id] === '1'; // or however it was previously
                }

                const isFirstRowHighlighted = waitingForAction === 'FIRST_CLAIM_TRUE' && idx === 0 && !isCorrect;
                const isRestHighlighted = waitingForAction === 'ALL_CLAIMS_TRUE' && idx > 0 && !isCorrect;
                const isRowHighlighted = isFirstRowHighlighted || isRestHighlighted;

                return (
                  <tr
                    key={claim.id}
                    className={`relative hover:bg-slate-50/20 transition-colors ${hasError ? 'bg-red-50/20 hover:bg-red-50/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      {isRowHighlighted && (
                        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                          <div className="absolute inset-0 border-2 border-violet-500/60 animate-pulse" />
                          <div className="absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-transparent via-violet-400/20 to-transparent animate-shimmer" style={{ filter: 'blur(3px)' }} />
                        </div>
                      )}
                      <span className="font-medium text-slate-800 italic leading-relaxed text-xs md:text-sm block">
                        “{formatClaimText(claim.claimText)}”
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
          <TutorialHighlight active={waitingForAction === 'SUBMIT_ANSWERS'} roundedClass="rounded-lg">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
            >
              {form.formState.isSubmitting ? 'Submitting...' : 'Submit Answers'}
            </button>
          </TutorialHighlight>
        </div>
      </form>
    </div>
  );

  return (
    <StudyLayout
      task={taskNode}
      submitContent={submitFormNode}
      onSubmit={form.handleSubmit(onSubmit)}
      productId={productId}
      conditionType={conditionType}
    >
      <ProductPanel productData={uiProductData as any} />
      <WebshopLayout
        condition={conditionType === 'TUTORIAL' ? 'dashboard' : conditionType.toLowerCase() as 'unassisted' | 'dashboard' | 'chatbot'}
        topContent={null}
        leftContent={null}
        middleContent={
          <div>
            {/* For TUTORIAL condition, show dashboard -> chatbot -> reviews stacked */}
            {(conditionType === 'DASHBOARD' || (conditionType === 'TUTORIAL' && currentStep >= 5)) && (
              <div id="tutorial-dashboard">
                <DashboardPanel aspectData={aspectData} productId={productId} conditionType={conditionType} />
              </div>
            )}
            {(conditionType === 'CHATBOT' || (conditionType === 'TUTORIAL' && currentStep >= 3 && currentStep < 5)) && (
              <div id="tutorial-chatbot">
                <ChatbotPanel productId={productId} />
              </div>
            )}

            {/* Review list (shown for all conditions) */}
            <div id="tutorial-review-list">
              <ReviewListPanel
                key={conditionType === 'TUTORIAL' ? `reviews-step-${currentStep}` : 'reviews-normal'}
                reviews={reviews}
                starDistribution={computedStarDistribution}
                averageRating={uiProductData.avgRating}
                totalCount={uiProductData.totalReviews}
              />
            </div>
          </div>
        }
      />
    </StudyLayout>
  );
}

