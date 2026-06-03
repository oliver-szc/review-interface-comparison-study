'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QuestionnaireLayout } from '@/components/forms/QuestionnaireLayout';
import { QuestionCard } from '@/components/forms/QuestionCard';
import { LikertScale } from '@/components/forms/LikertScale';
import { VerticalRadioGroup } from '@/components/forms/VerticalRadioGroup';
import { AriaInvalidSync } from '@/components/forms/AriaInvalidSync';

interface PostConditionProps {
  blockIndex: 1 | 2 | 3;
  conditionType: 'BASELINE' | 'DASHBOARD' | 'CHATBOT';
}

const PostConditionSchema = z.object({
  tlx_md: z.string().min(1, "Please answer this question."),
  tlx_td: z.string().min(1, "Please answer this question."),
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

const TLX_LABELS = [
  { value: 1, label: "Very Low" },
  { value: 7, label: "Very High" }
];

const PU_LABELS = [
  { value: 1, label: "strongly disagree" },
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
    BASELINE: "the unassisted review section",
    DASHBOARD: "the interactive dashboard",
    CHATBOT: "the AI chatbot"
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
      <QuestionnaireLayout
        form={form}
        onSubmit={onSubmit}
        submitLabel="Continue"
        hideFooter={true}
      >
        <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Post-Task Evaluation ({blockIndex}/3)</h1>
            <p className="text-slate-600 mt-2">
              Please evaluate your experience using <strong><i>{systemName}</i></strong> for the previous task.
            </p>
          </div>

          {/* --- NASA-TLX --- */}
          <div className="!mt-24">
            <h2 className="text-xl font-semibold text-slate-800">Task Load</h2>
          </div>

          <QuestionCard
            question="How mentally demanding was the task?"
            error={errors.tlx_md}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={TLX_LABELS} registration={register('tlx_md')} />
          </QuestionCard>

          <QuestionCard
            question="How hurried or rushed was the pace of the task?"
            error={errors.tlx_td}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={TLX_LABELS} registration={register('tlx_td')} />
          </QuestionCard>

          <QuestionCard
            question="How hard did you have to work to accomplish your level of performance?"
            error={errors.tlx_effort}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={TLX_LABELS} registration={register('tlx_effort')} />
          </QuestionCard>

          <QuestionCard
            question="How insecure, discouraged, irritated, stressed, and annoyed were you?"
            error={errors.tlx_frustration}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={TLX_LABELS} registration={register('tlx_frustration')} />
          </QuestionCard>

          {/* --- TAM-PU --- */}
          <div className="!mt-24">
            <h2 className="text-xl font-semibold text-slate-800">System Evaluation</h2>
          </div>

          <QuestionCard
            question={`Using ${systemName} improves my performance when finding information.`}
            error={errors.pu_1}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={PU_LABELS} registration={register('pu_1')} />
          </QuestionCard>

          <QuestionCard
            question={`Using ${systemName} enhances my effectiveness when finding information.`}
            error={errors.pu_3}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={PU_LABELS} registration={register('pu_3')} />
          </QuestionCard>

          <QuestionCard
            question={`I find ${systemName} to be useful.`}
            error={errors.pu_4}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <LikertScale scaleLength={7} labels={PU_LABELS} registration={register('pu_4')} />
          </QuestionCard>

          {/* --- Manipulation Check (Nur Assistenz-Conditions) --- */}
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

          {/* --- Attention Check (Nur in Block 2) --- */}
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
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-sm transition-colors text-lg"
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </QuestionnaireLayout>
    </>
  );
}
