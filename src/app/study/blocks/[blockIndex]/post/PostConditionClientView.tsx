'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QuestionnaireLayout } from '@/components/forms/QuestionnaireLayout';
import { QuestionCard } from '@/components/forms/QuestionCard';
import { NasaTlxScale } from '@/components/forms/NasaTlxScale';
import { VerticalRadioGroup } from '@/components/forms/VerticalRadioGroup';
import { AriaInvalidSync } from '@/components/forms/AriaInvalidSync';
import { StudyPageGrid } from '@/components/layouts/StudyPageGrid';

interface PostConditionProps {
  blockIndex: 1 | 2 | 3;
  conditionType: 'BASELINE' | 'DASHBOARD' | 'CHATBOT';
}

const PostConditionSchema = z.object({
  tlx_mental_demand: z.string().min(1, "Please answer this question."),
  tlx_physical_demand: z.string().min(1, "Please answer this question."),
  tlx_temporal_demand: z.string().min(1, "Please answer this question."),
  tlx_performance: z.string().min(1, "Please answer this question."),
  tlx_effort: z.string().min(1, "Please answer this question."),
  tlx_frustration: z.string().min(1, "Please answer this question."),

  pu_1: z.string().min(1, "Please answer this question."),
  pu_3: z.string().min(1, "Please answer this question."),
  pu_4: z.string().min(1, "Please answer this question."),

  assist_use: z.string().optional(),
  scr_attention: z.string().optional(),
}).superRefine((data, ctx) => {
  // If it's a condition type that requires assist_use check
  // We can't access component props directly in here unless we pass them or use a dynamic schema
  // Let's rely on the form submission manual validation for conditionally rendered fields,
  // or we can just ensure they are populated dynamically.
});

// NASA-TLX dimension definitions
const TLX_DIMENSIONS = [
  { field: 'tlx_mental_demand', name: 'Mental Demand', question: 'How mentally demanding was the task?' },
  { field: 'tlx_physical_demand', name: 'Physical Demand', question: 'How physically demanding was the task?' },
  { field: 'tlx_temporal_demand', name: 'Temporal Demand', question: 'How hurried or rushed was the pace of the task?' },
  { field: 'tlx_performance', name: 'Performance', question: 'How successful were you in accomplishing what you were asked to do?' },
  { field: 'tlx_effort', name: 'Effort', question: 'How hard did you have to work to accomplish your level of performance?' },
  { field: 'tlx_frustration', name: 'Frustration', question: 'How insecure, discouraged, irritated, stressed, and annoyed were you?' },
] as const;

const PU_LABELS = [
  { value: 1, label: "strongly disagree" },
  { value: 2, label: "moderately disagree" },
  { value: 3, label: "somewhat disagree" },
  { value: 4, label: "neutral" },
  { value: 5, label: "somewhat agree" },
  { value: 6, label: "moderately agree" },
  { value: 7, label: "strongly agree" }
];

const EXTENT_OPTIONS = [
  { value: 1, label: "Not at all (I did not interact with it)" },
  { value: 2, label: "Slightly" },
  { value: 3, label: "Moderately" },
  { value: 4, label: "Considerably" },
  { value: 5, label: "Extensively" }
];

const FREQUENCY_OPTIONS = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Very often" }
];

export default function PostConditionClientView({ blockIndex, conditionType }: PostConditionProps) {
  const form = useForm<z.infer<typeof PostConditionSchema>>({
    resolver: zodResolver(PostConditionSchema),
    mode: 'onSubmit',
  });

  const { register, formState: { errors, isSubmitting } } = form;

  const systemNameMap = {
    BASELINE: "the review section",
    DASHBOARD: "the dashboard",
    CHATBOT: "the chatbot"
  };
  const systemName = systemNameMap[conditionType];

  const onSubmit = async (data: z.infer<typeof PostConditionSchema>) => {
    // 1. Manual validation for conditional fields since Zod schema is static
    if (conditionType !== 'BASELINE' && !data.assist_use) {
      alert("Please answer the extent of assistance question.");
      return;
    }
    if (blockIndex === 2 && !data.scr_attention) {
      alert("Please answer the quality assurance question.");
      return;
    }

    try {
      const response = await fetch(`/api/study/blocks/${blockIndex}/post`, {
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
      <StudyPageGrid>
        <QuestionnaireLayout
          form={form}
          onSubmit={onSubmit}
          submitLabel="Continue"
          hideFooter={true}
          className="max-w-none w-full px-0"
        >
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Post-Task Evaluation ({blockIndex}/3)</h1>
              <p className="text-slate-600 mt-2">
                Please evaluate your experience using <strong><i>{systemName}</i></strong> for the previous task.
              </p>
            </div>

            {/* --- NASA-TLX --- */}
            <div className="!mt-24">
              <h2 className="text-xl font-semibold text-slate-900">Task Load</h2>
            </div>

            {TLX_DIMENSIONS.map((dim) => (
              <NasaTlxScale
                key={dim.field}
                name={dim.name}
                question={dim.question}
                registration={register(dim.field as 'tlx_mental_demand' | 'tlx_physical_demand' | 'tlx_temporal_demand' | 'tlx_performance' | 'tlx_effort' | 'tlx_frustration')}
                error={errors[dim.field as keyof typeof errors] as import('react-hook-form').FieldError | undefined}
              />
            ))}

            {/* --- TAM-PU --- */}
            <div className="!mt-24">
              <h2 className="text-xl font-semibold text-slate-900">Perceived Usefulness</h2>
            </div>

            <div className="overflow-x-auto w-full mt-8 mb-8 border border-slate-200 rounded-xl bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs md:text-sm table-fixed">
                <colgroup>
                  <col className="w-4/12" />
                  <col className="w-[8.5%]" />
                  <col className="w-[8.5%]" />
                  <col className="w-[8.5%]" />
                  <col className="w-[8.5%]" />
                  <col className="w-[8.5%]" />
                  <col className="w-[8.5%]" />
                  <col className="w-[8.5%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th scope="col" className="p-5 font-semibold text-slate-500 leading-relaxed align-bottom normal-case tracking-normal">
                      Please indicate the degree to which you agree/disagree with the following statements.
                    </th>
                    {PU_LABELS.map((opt) => {
                      const firstWord = opt.label ? opt.label.split(' ')[0] : '';
                      const restWords = opt.label ? opt.label.split(' ').slice(1).join(' ') : '';
                      return (
                        <th key={opt.value} scope="col" className="text-center font-semibold text-slate-500">
                          {opt.label && (
                            <div className="text-center text-xs text-slate-500 lowercase leading-tight">
                              {firstWord}
                              {restWords && <br />}
                              {restWords}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {[
                    { name: 'pu_1', text: `Using ${systemName} improves my performance in finding relevant information in the reviews.` },
                    { name: 'pu_3', text: `Using ${systemName} enhances my effectiveness in finding relevant information in the reviews.` },
                    { name: 'pu_4', text: `I find ${systemName} to be useful for finding relevant information in the reviews.` },
                  ].map((item) => {
                    const hasError = !!errors[item.name as keyof typeof errors];
                    const registration = register(item.name as 'pu_1' | 'pu_3' | 'pu_4');
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
                        {[1, 2, 3, 4, 5, 6, 7].map((value) => {
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
                                    className="h-5 w-5 shrink-0 rounded-full border-slate-300 text-sky-600 focus:ring-0 focus:outline-none cursor-pointer"
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

            {/* --- Manipulation Check (Only in assistance-conditions) --- */}
            {conditionType !== 'BASELINE' && (
              <QuestionCard
                question={`To what extent did you use the ${conditionType.toLowerCase()} assistance during the task?`}
                error={errors.assist_use}
                required={false}
                className="shadow-none border-none p-0 bg-transparent !mt-24"
              >
                <VerticalRadioGroup options={EXTENT_OPTIONS} registration={register('assist_use')} />
              </QuestionCard>
            )}

            {/* --- Attention Check (Only in block 2) --- */}
            {blockIndex === 2 && (
              <QuestionCard
                question="For quality assurance purposes: Please select 'Sometimes'."
                error={errors.scr_attention}
                required={false}
                className="shadow-none border-none p-0 bg-transparent !mt-24"
              >
                <VerticalRadioGroup options={FREQUENCY_OPTIONS} registration={register('scr_attention')} />
              </QuestionCard>
            )}

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
              >
                {isSubmitting ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </div>
        </QuestionnaireLayout>
      </StudyPageGrid>
    </>
  );
}
