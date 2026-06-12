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

const DemographicsSchema = z.object({
  demo_age: z.string().min(1, "Please enter your age.").refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 18 && Number(val) <= 40,
    { message: "Age must be between 18 and 40." }
  ),
  demo_gender: z.string().min(1, "Please select your gender."),
  demo_studystatus: z.string().min(1, "Please select your academic standing."),
  demo_field: z.string().min(1, "Please select your field of study."),
  scr_english: z.string().min(1, "Please select your English proficiency level."),
});

type DemographicsFormValues = z.infer<typeof DemographicsSchema>;

export default function DemographicsPage() {
  const router = useRouter();

  const form = useForm<DemographicsFormValues>({
    resolver: zodResolver(DemographicsSchema),
    mode: 'onSubmit',
  });

  const { register, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (data: DemographicsFormValues) => {
    try {
      const response = await fetch('/api/study/demographics', {
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
          submitLabel="Continue"
          hideFooter={true}
          className="max-w-none w-full px-0"
        >
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 space-y-16">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Demographics</h1>
            <p className="text-slate-600 mt-2">Please answer a few questions about yourself.</p>
          </div>

          <QuestionCard
            question="How old are you?"
            error={errors.demo_age}
            required={false}
            className="shadow-none border-none p-0 bg-transparent"
          >
            <input
              type="number"
              min={18}
              max={40}
              placeholder="e.g. 25"
              className="w-full sm:w-32 py-2.5 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring--500 focus:border--500 outline-none text-slate-900 bg-white text-sm"
              {...register('demo_age')}
            />
          </QuestionCard>

          <QuestionCard
            question="What is your gender?"
            error={errors.demo_gender}
            required={false}
            className="shadow-none border-none p-0 bg-transparent !mt-16"
          >
            <VerticalRadioGroup
              options={[
                { value: 1, label: 'Male' },
                { value: 2, label: 'Female' },
                { value: 3, label: 'Non-binary' },
                { value: 4, label: 'Prefer not to say' },
              ]}
              registration={register('demo_gender')}
            />
          </QuestionCard>

          <QuestionCard
            question="What is your current academic standing?"
            error={errors.demo_studystatus}
            required={false}
            className="shadow-none border-none p-0 bg-transparent !mt-16"
          >
            <VerticalRadioGroup
              options={[
                { value: 1, label: "Bachelor's, semester 1–3" },
                { value: 2, label: "Bachelor's, semester 4+" },
                { value: 3, label: "Master's" },
                { value: 4, label: "State examination / dual program / other" },
              ]}
              registration={register('demo_studystatus')}
            />
          </QuestionCard>

          <QuestionCard
            question="What is your field of study?"
            error={errors.demo_field}
            required={false}
            className="shadow-none border-none p-0 bg-transparent !mt-16"
          >
            <VerticalRadioGroup
              options={[
                { value: 1, label: 'Engineering & Computer Science' },
                { value: 2, label: 'Mathematics & Natural Sciences' },
                { value: 3, label: 'Economics' },
                { value: 4, label: 'Psychology & Social Sciences' },
                { value: 5, label: 'Humanities/Cultural Studies & Teacher Education' },
                { value: 6, label: 'Medicine & Law' },
                { value: 7, label: 'Other' },
              ]}
              registration={register('demo_field')}
            />
          </QuestionCard>

          <QuestionCard
            question="What is your level of English proficiency (Englischkenntnisse)?"
            error={errors.scr_english}
            required={false}
            className="shadow-none border-none p-0 bg-transparent !mt-16"
          >
            <VerticalRadioGroup
              options={[
                { value: 1, label: 'Beginner (Anfänger, A1/A2)' },
                { value: 2, label: 'Intermediate (Gut, B1/B2)' },
                { value: 3, label: 'Advanced (Sehr gut, C1)' },
                { value: 4, label: 'Native (Perfekt, C2)' },
              ]}

              registration={register('scr_english')}
            />
          </QuestionCard>

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
