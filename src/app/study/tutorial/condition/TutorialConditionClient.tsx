'use client';

import { useState, useRef, useEffect } from 'react';
import TaskClientView from '../../blocks/[blockIndex]/task/TaskClientView';
import type { AspectStat } from '@/lib/queries/absa';
import { TutorialProvider } from '@/lib/contexts/TutorialContext';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';

interface TutorialConditionClientProps {
  claims: any[];
  productData: any;
  reviews: any[];
  starDistribution: any[];
  aspectData: AspectStat[];
}

const TUTORIAL_STEPS = [
  // Step 0: Card 2
  {
    content: (
      <div>
        <h1 className="text-xl font-bold text-slate-800 !mb-4">The Study Task</h1>
        <p className="text-slate-700 leading-relaxed !mb-2">
          This is the main page where you will complete your tasks. It simulates a typical product page with user reviews. Throughout the study, you will use three different assistance systems to explore these reviews. We will now briefly introduce each system.</p>
      </div>
    ),
  },
  // Step 1: Card 3 (Reviews)
  {
    content: (
      <div>
        <h1 className="text-xl font-bold text-slate-800 !mb-4">The Review Section</h1>
        <p className="text-slate-700 leading-relaxed !mb-2">
          This is the standard section containing all customer reviews. Here, you can:
        </p>
        <div className="text-slate-750 font-normal">
          <ul className="list-disc pl-5 !my-2 !space-y-1">
            <li><span className="font-bold">view </span> all reviews</li>
            <li><span className="font-bold">sort </span> the reviews</li>
            <li><span className="font-bold">filter </span>the reviews using a keyword search</li>
          </ul>
        </div>
        <p className="text-slate-750 font-normal !mt-2">
          For practice, sort the reviews by “5 stars only”, then enter a word in the search bar and click “Search”.
        </p>
      </div>
    ),
  },
  // Step 2: Waiting for Search
  { requiresAction: 'REVIEW_SEARCH', content: null },
  // Step 3: Card 4 (Chatbot)
  {
    content: (
      <div>
        <h1 className="text-xl font-bold text-slate-800 !mb-4">The Chatbot</h1>
        <p className="text-slate-700 leading-relaxed !mb-2">
          This assistance allows you to ask specific questions about the reviews to quickly gather insights. Here, you can:
        </p>
        <div className="text-slate-750 font-normal">
          <ul className="list-disc pl-5 !my-2 !space-y-1">
            <li><span className="font-bold">ask </span> specific questions about the review</li>
            <li><span className="font-bold">get </span> tailored answers regarding the topic</li>
          </ul>
        </div>
        <p className="text-slate-750 font-normal !mt-2">
          For practice, select one of the suggested question to trigger an answer from the chatbot.
        </p>
      </div>
    ),
  },
  // Step 4: Waiting for Chatbot click
  { requiresAction: 'CHATBOT_SUGGESTION_CLICK', content: null },
  // Step 5: Card 5 (Dashboard)
  {
    content: (
      <div>
        <h1 className="text-xl font-bold text-slate-800 !mb-4">The Dashboard</h1>
        <p className="text-slate-700 leading-relaxed !mb-2">
          This assistance gives you a structured overview of the reviews based on categories. Here, you can:
        </p>
        <div className="text-slate-750 font-normal">
          <ul className="list-disc pl-5 !my-2 !space-y-1">
            <li><span className="font-bold">view </span> reviews grouped by category</li>
            <li><span className="font-bold">explore </span> the reviews in each category</li>
            <li><span className="font-bold">see </span> highlights based on the customers opinions</li>
          </ul>
        </div>
        <p className="text-slate-750 font-normal !mt-2">
          For practice, select one of the categories, click on “Show more” to expand the list of reviews and close the view again by clicking “Show less”.
        </p>
      </div>
    ),
  },
  // Step 6: Waiting for Dashboard Aspect selection
  { requiresAction: 'DASHBOARD_CLICK_ASPECT', content: null },
  // Step 7: Waiting for Dashboard Show More
  { requiresAction: 'DASHBOARD_SHOW_MORE', content: null },
  // Step 8: Waiting for Dashboard Show Less
  { requiresAction: 'DASHBOARD_SHOW_LESS', content: null },
  // Step 9: Card 6 (InfoNeedBanner Intro)
  {
    content: (
      <div>
        <h1 className="text-xl font-bold text-slate-800 !mb-4">Answering the Claims</h1>
        <p className="text-slate-700 leading-relaxed mb-4">
          Now that you are familiar with the systems, you will learn how to enter your answers.
          To proceed, click "Open Answer Form" and mark the first claim as "True".
        </p>
      </div >
    ),
  },
  // Step 10: Waiting for Open Answer Form button click
  { requiresAction: 'OPEN_ANSWER_FORM', content: null },
  // Step 11: Waiting for First Claim True
  { requiresAction: 'FIRST_CLAIM_TRUE', content: null },
  // Step 11: Card 7 (Form usage)
  {
    content: (
      <div>
        <h1 className="text-xl font-bold text-slate-900 mb-6">Completing the Form</h1>
        <p className="text-slate-700 font-normal leading-relaxed mb-4">
          You can open and close the answer form at any time while gathering information. Your progress is saved, so you can work through the claims one by one.
          To proceed, please complete the remaining answers.
        </p>
      </div>
    ),
  },
  // Step 12: Waiting for All Claims True
  { requiresAction: 'ALL_CLAIMS_TRUE', content: null },
  // Step 13: Card 8 (Submit Intro)
  {
    content: (
      <div>
        <h1 className="text-xl font-bold text-slate-900 mb-6">Submitting the Task</h1>
        <p className="text-slate-700 font-normal leading-relaxed mb-4">
          Once you have answered all claims, you can submit the task. Please click “Submit answers” to complete this tutorial task
        </p>
      </div>
    ),
  },
  // Step 14: Waiting for Submit
  { requiresAction: 'SUBMIT_ANSWERS', content: null },
];

export default function TutorialConditionClient({
  claims,
  productData,
  reviews,
  starDistribution,
  aspectData,
}: TutorialConditionClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleStep, setVisibleStep] = useState(0);
  const [transitionState, setTransitionState] = useState<'idle' | 'cooldown' | 'fading'>('idle');
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const handleTaskSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/study/tutorial/condition', { method: 'POST' });
      const result = await response.json();
      if (result.redirectUrl) {
        window.location.replace(result.redirectUrl);
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleTutorialAction = (action: string) => {
    const currentStepConfig = TUTORIAL_STEPS[visibleStep];
    if (currentStepConfig?.requiresAction === action) {
      const isAssistanceStep = [
        'REVIEW_SEARCH',
        'CHATBOT_SUGGESTION_CLICK',
        'DASHBOARD_SHOW_LESS',
      ].includes(action);

      if (isAssistanceStep) {
        setTransitionState('cooldown');
        const t1 = setTimeout(() => {
          setTransitionState('fading');
        }, 3000);
        const t2 = setTimeout(() => {
          setVisibleStep((prev) => prev + 1);
          setTransitionState('idle');
        }, 5000);
        timeoutRefs.current.push(t1, t2);
      } else {
        setVisibleStep((prev) => prev + 1);
      }
    }
  };

  const currentStepConfig = TUTORIAL_STEPS[visibleStep];

  return (
    <TutorialProvider
      currentStep={visibleStep}
      waitingForAction={transitionState !== 'idle' ? null : (currentStepConfig?.requiresAction || null)}
      onAction={handleTutorialAction}
    >
      <div className="relative min-h-screen">
        {/* The underlying interactive task view */}
        <TaskClientView
          blockIndex={0}
          conditionType="TUTORIAL"
          productId="EARBUDS"
          claims={claims}
          productData={productData}
          reviews={reviews}
          starDistribution={starDistribution}
          aspectData={aspectData}
          onTutorialSubmit={handleTaskSubmit}
        />

        {/* The floating tutorial overlay */}
        <TutorialOverlay
          isVisible={visibleStep < TUTORIAL_STEPS.length && currentStepConfig?.content !== null}
          content={currentStepConfig?.content}
          requiresAction={currentStepConfig?.requiresAction}
          onContinue={() => setVisibleStep((v) => v + 1)}
          position="center"
          transitionState={transitionState}
        />
      </div>
    </TutorialProvider>
  );
}
