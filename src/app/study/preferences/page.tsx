'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { QuestionnaireLayout } from '@/components/forms/QuestionnaireLayout';
import { QuestionCard } from '@/components/forms/QuestionCard';
import { LikertScale } from '@/components/forms/LikertScale';
import { TextArea } from '@/components/forms/TextArea';
import { AriaInvalidSync } from '@/components/forms/AriaInvalidSync';

const PreferencesSchema = z.object({
  pref_chatbot: z.string().min(1, "Please rate the AI chatbot."),
  pref_dashboard: z.string().min(1, "Please rate the data dashboard."),
  pref_baseline: z.string().min(1, "Please rate the unassisted baseline."),
  pref_comment: z.string().optional(),
});

type PreferencesFormData = z.infer<typeof PreferencesSchema>;

const PREF_LABELS = [
  { value: 1, label: "strongly disagree" },
  { value: 7, label: "strongly agree" }
];

export default function PreferencesPage() {
  const router = useRouter();

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(PreferencesSchema),
    mode: 'onSubmit',
  });

  const { register, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (data: PreferencesFormData) => {
    try {
      const response = await fetch('/api/study/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      if (result.redirectUrl) {
        window.location.replace(result.redirectUrl);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <AriaInvalidSync />
      <QuestionnaireLayout
        form={form}
        onSubmit={onSubmit}
        submitLabel="Complete Study"
        hideFooter={true}
        className="max-w-none w-full px-0"
      >
        <div className="w-[33.333%] mx-auto bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">System Preferences & Feedback</h1>
            <p className="text-slate-600 mt-2">
              You have completed all tasks! Before you finish, take a moment to reflect on the different ways of exploring reviews
            </p>
          </div>

          <div className="!mt-20">
            <h2 className="text-xl font-semibold text-slate-900">System Preferences</h2>
            <p className="text-slate-600 mt-3 text-sm leading-relaxed">
              Please indicate the degree to which you agree/disagree with the following statements.
            </p>
          </div>

          <QuestionCard
            question="I consider the chatbot assistance a preferable way to explore product reviews."
            error={errors.pref_chatbot}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={PREF_LABELS} registration={register('pref_chatbot')} textLabelsAtBottom={true} />
          </QuestionCard>

          <QuestionCard
            question="I consider the data dashboard a preferable way to explore product reviews."
            error={errors.pref_dashboard}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={PREF_LABELS} registration={register('pref_dashboard')} textLabelsAtBottom={true} />
          </QuestionCard>

          <QuestionCard
            question="I consider exploring product reviews without additional assistance a preferable way."
            error={errors.pref_baseline}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={PREF_LABELS} registration={register('pref_baseline')} textLabelsAtBottom={true} />
          </QuestionCard>

          <QuestionCard
            question={
              <span className="text-lg font-medium text-slate-900 block leading-snug">
                Do you have any additional thoughts to share? We welcome all feedback, including what you liked, ideas for improvement, or other observations.
              </span>
            }
            error={errors.pref_comment}
            required={false}
            className="shadow-none border-none p-0 bg-transparent !mt-24"
          >
            <TextArea
              registration={register('pref_comment')}
              placeholder="Your feedback... (optional)"
              className="p-6 bg-slate-50/30 rounded-xl border border-slate-200 text-base focus:bg-white focus:border--500 focus:ring-1 focus:ring--500 transition-colors"
            />
          </QuestionCard>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
            >
              {isSubmitting ? 'Processing...' : 'Complete Study'}
            </button>
          </div>
        </div>
      </QuestionnaireLayout>
    </>
  );
}
