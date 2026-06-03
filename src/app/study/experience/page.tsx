'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { QuestionnaireLayout } from '@/components/forms/QuestionnaireLayout';
import { QuestionCard } from '@/components/forms/QuestionCard';
import { VerticalRadioGroup } from '@/components/forms/VerticalRadioGroup';
import { LikertScale } from '@/components/forms/LikertScale';
import { AriaInvalidSync } from '@/components/forms/AriaInvalidSync';

const ExperienceSchema = z.object({
  exp_reviews: z.string().min(1, "Please answer this question."),
  exp_chatbots: z.string().min(1, "Please answer this question."),
  exp_dashboards: z.string().min(1, "Please answer this question."),

  ati_1: z.string().min(1, "Please answer this question."),
  ati_2: z.string().min(1, "Please answer this question."),
  ati_3: z.string().min(1, "Please answer this question."),
  ati_4: z.string().min(1, "Please answer this question."),
});

type ExperienceFormData = z.infer<typeof ExperienceSchema>;

const FREQUENCY_OPTIONS = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Very often" }
];

const ATI_LABELS = [
  { value: 1, label: "completely disagree" },
  { value: 6, label: "completely agree" }
];

export default function ExperiencePage() {
  const router = useRouter();

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(ExperienceSchema),
    mode: 'onSubmit',
  });

  const { register, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      const response = await fetch('/api/study/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit data');
      }

      if (result.redirectUrl) {
        window.location.replace(result.redirectUrl);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <AriaInvalidSync />
      <QuestionnaireLayout
        form={form}
        onSubmit={onSubmit}
        submitLabel="Continue to Tutorial"
        hideFooter={true}
      >
        <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Background & Experience</h1>
            <p className="text-slate-600 mt-2">Please tell us about your prior experience with digital tools and reviews.</p>
          </div>

          {/* --- BLOCK 1: ERFAHRUNG --- */}
          <QuestionCard
            question="How often do you check product reviews on Amazon or other online stores before making a purchase decision?"
            error={errors.exp_reviews}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <VerticalRadioGroup options={FREQUENCY_OPTIONS} registration={register('exp_reviews')} />
          </QuestionCard>

          <QuestionCard
            question="How often have you used chatbots or AI assistants (e.g., ChatGPT) to find information?"
            error={errors.exp_chatbots}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <VerticalRadioGroup options={FREQUENCY_OPTIONS} registration={register('exp_chatbots')} />
          </QuestionCard>

          <QuestionCard
            question="How often have you used interactive dashboards or charts (e.g., Google Analytics, Excel charts) for data analysis?"
            error={errors.exp_dashboards}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <VerticalRadioGroup options={FREQUENCY_OPTIONS} registration={register('exp_dashboards')} />
          </QuestionCard>

          {/* --- BLOCK 2: ATI-S --- */}
          <div className="!mt-24">
            <h2 className="text-xl font-semibold text-slate-800">General Interaction with Technology</h2>
            <p className="text-slate-600 mt-3 text-sm leading-relaxed">
              The following statements refer to your general interaction with technical systems (e.g., software applications, digital devices). Please indicate the degree to which you agree/disagree with the following statements.
            </p>
          </div>

          <QuestionCard
            question="I like to occupy myself in greater detail with technical systems."
            error={errors.ati_1}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={6} labels={ATI_LABELS} registration={register('ati_1')} />
          </QuestionCard>

          <QuestionCard
            question="I like testing the functions of new technical systems."
            error={errors.ati_2}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={6} labels={ATI_LABELS} registration={register('ati_2')} />
          </QuestionCard>

          <QuestionCard
            question="It is enough for me that a technical system works; I don’t care how or why."
            error={errors.ati_3}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={6} labels={ATI_LABELS} registration={register('ati_3')} />
          </QuestionCard>

          <QuestionCard
            question="It is enough for me to know the basic functions of a technical system."
            error={errors.ati_4}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={6} labels={ATI_LABELS} registration={register('ati_4')} />
          </QuestionCard>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-sm transition-colors text-lg"
            >
              {isSubmitting ? 'Processing...' : 'Continue to Tutorial'}
            </button>
          </div>
        </div>
      </QuestionnaireLayout>
    </>
  );
}
