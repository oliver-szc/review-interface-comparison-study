'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { QuestionnaireLayout } from '@/components/forms/QuestionnaireLayout';
import { QuestionCard } from '@/components/forms/QuestionCard';
import { VerticalRadioGroup } from '@/components/forms/VerticalRadioGroup';
import { AriaInvalidSync } from '@/components/forms/AriaInvalidSync';
import { StudyPageGrid } from '@/components/layouts/StudyPageGrid';

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
  { value: 2, label: "largely disagree" },
  { value: 3, label: "slightly disagree" },
  { value: 4, label: "slightly agree" },
  { value: 5, label: "largely agree" },
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
      <StudyPageGrid>
        <QuestionnaireLayout
          form={form}
          onSubmit={onSubmit}
          submitLabel="Continue to Tutorial"
          hideFooter={true}
          className="max-w-none w-full px-0"
        >
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Background & Experience</h1>
              <p className="text-slate-600 mt-2">Please tell us about your prior experience with digital tools and reviews.</p>
            </div>

            {/* --- BLOCK 1: ERFAHRUNG --- */}
            <QuestionCard
              question="How often do you check product reviews on Amazon or other online stores before making a purchase decision?"
              error={errors.exp_reviews}
              required={false}
              className="shadow-none border-none p-0 bg-transparent !mt-20"
            >
              <VerticalRadioGroup options={FREQUENCY_OPTIONS} registration={register('exp_reviews')} />
            </QuestionCard>

            <QuestionCard
              question="How often have you used chatbots or AI assistants (e.g., ChatGPT, Google AI Search) to find and evaluate information?"
              error={errors.exp_chatbots}
              required={false}
              className="shadow-none border-none p-0 bg-transparent"
            >
              <VerticalRadioGroup options={FREQUENCY_OPTIONS} registration={register('exp_chatbots')} />
            </QuestionCard>

            <QuestionCard
              question="How often have you used interactive dashboards (e.g., health or fitness apps, phone usage statistics, Mentimeter) to explore structured information?"
              error={errors.exp_dashboards}
              required={false}
              className="shadow-none border-none p-0 bg-transparent"
            >
              <VerticalRadioGroup options={FREQUENCY_OPTIONS} registration={register('exp_dashboards')} />
            </QuestionCard>

            {/* --- BLOCK 2: ATI-S --- */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 !mt-24">Interaction with technical systems</h2>
              <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                In the following, we will ask you about your interaction with technical systems. The term “technical systems” refers to apps and other software applications, as well as entire digital devices (e.g., mobile phone, computer, TV, car navigation).
              </p>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto w-full mt-8 mb-8 border border-slate-200 rounded-xl bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs md:text-sm table-fixed">
                <colgroup>
                  <col className="w-5/12" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th scope="col" className="p-5 font-semibold text-slate-500 leading-relaxed normal-case tracking-normal">
                      Please indicate the degree to which you agree/disagree with the following statements.
                    </th>
                    {ATI_LABELS.map((opt) => {
                      const firstWord = opt.label.split(' ')[0];
                      const restWords = opt.label.split(' ').slice(1).join(' ');
                      return (
                        <th key={opt.value} scope="col" className="text-center font-semibold text-slate-500">
                          <div className="text-center text-xs text-slate-500 lowercase leading-tight">
                            {firstWord}
                            <br />
                            {restWords}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {[
                    { name: 'ati_1', text: 'I like to occupy myself in greater detail with technical systems.' },
                    { name: 'ati_2', text: 'I like testing the functions of new technical systems.' },
                    { name: 'ati_3', text: 'It is enough for me that a technical system works; I don’t care how or why.' },
                    { name: 'ati_4', text: 'It is enough for me to know the basic functions of a technical system.' },
                  ].map((item) => {
                    const hasError = !!errors[item.name as keyof typeof errors];
                    const registration = register(item.name as 'ati_1' | 'ati_2' | 'ati_3' | 'ati_4');
                    const { ref: formRef, ...restRegistration } = registration;

                    return (
                      <tr
                        key={item.name}
                        className={`hover:bg-slate-50/40 transition-colors ${hasError ? 'bg-red-50/20 hover:bg-red-50/30' : ''
                          }`}
                      >
                        <td className="px-3 md:px-6 py-4 font-medium text-slate-800 leading-relaxed">
                          {item.text}
                          {hasError && (
                            <span className="block text-xs text-red-600 font-medium mt-1">
                              Please answer this question.
                            </span>
                          )}
                        </td>
                        {[1, 2, 3, 4, 5, 6].map((value) => {
                          const inputId = `${item.name}-${value}`;
                          return (
                            <td key={value} className="px-0.5 sm:px-1.5 py-4 text-center">
                              <div className="flex items-center justify-center">
                                <label
                                  htmlFor={inputId}
                                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-slate-100/50 transition-colors active:scale-95 focus-within:ring-2 focus-within:ring-slate-300"
                                >
                                  <input
                                    id={inputId}
                                    type="radio"
                                    value={value}
                                    {...restRegistration}
                                    ref={(e) => {
                                      formRef(e);
                                    }}
                                    className="h-5 w-5 shrink-0 rounded-full border-slate-300 text--600 focus:ring-0 focus:outline-none cursor-pointer"
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

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
              >
                {isSubmitting ? 'Processing...' : 'Continue to Tutorial'}
              </button>
            </div>
          </div>
        </QuestionnaireLayout>
      </StudyPageGrid>
    </>
  );
}
