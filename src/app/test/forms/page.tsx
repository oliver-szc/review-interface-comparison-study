'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QuestionnaireLayout } from '@/components/forms/QuestionnaireLayout';
import { QuestionCard } from '@/components/forms/QuestionCard';
import { VerticalRadioGroup } from '@/components/forms/VerticalRadioGroup';
import { LikertScale } from '@/components/forms/LikertScale';
import { TextArea } from '@/components/forms/TextArea';
import { AriaInvalidSync } from '@/components/forms/AriaInvalidSync';

// 1. Define Zod Schema
const TestFormSchema = z.object({
  radioChoice: z.string().min(1, "Please select an option."),
  likertScore: z.string().min(1, "Please rate this item."),
  feedback: z.string().optional(),
});

type TestFormValues = z.infer<typeof TestFormSchema>;

export default function FormsTestPage() {
  // 2. Initialize React Hook Form
  const form = useForm<TestFormValues>({
    resolver: zodResolver(TestFormSchema),
    mode: 'onSubmit', // Validate strictly on submit as per best practices
  });

  const { register, formState: { errors } } = form;

  // 3. Handle Submission
  const onSubmit = async (data: TestFormValues) => {
    console.log('Form data submitted:', data);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <>
      <AriaInvalidSync />
      
      <QuestionnaireLayout 
        form={form} 
        onSubmit={onSubmit}
        submitLabel="Submit Test Form"
      >
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Form Components Test</h1>
          <p className="text-slate-600 mt-2">
            Try submitting without answering to see the accessible `:user-invalid` error states in action.
          </p>
        </div>

        <QuestionCard 
          question="Which option do you prefer?" 
          description="Select exactly one."
          error={errors.radioChoice}
        >
          <VerticalRadioGroup 
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ]}
            registration={register('radioChoice')}
          />
        </QuestionCard>

        <QuestionCard 
          question="How useful did you find this component?" 
          error={errors.likertScore}
        >
          <LikertScale 
            scaleLength={5}
            labels={[
              { value: 1, label: 'Not Useful' },
              { value: 5, label: 'Very Useful' }
            ]}
            registration={register('likertScore')}
          />
        </QuestionCard>

        <QuestionCard 
          question="Any additional feedback?" 
          required={false}
          error={errors.feedback}
        >
          <TextArea 
            placeholder="Type your feedback here..."
            registration={register('feedback')}
          />
        </QuestionCard>

      </QuestionnaireLayout>
    </>
  );
}
