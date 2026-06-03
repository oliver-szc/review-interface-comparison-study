'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/study/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize session');
      }

      if (data.redirectUrl) {
        // Use window.location.replace to ensure middleware cookie is read correctly
        // on the next page load without adding to the history stack.
        window.location.replace(data.redirectUrl);
      }
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-full bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-3xl px-4 pt-12 pb-12">
        <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Informed Consent</h1>

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-10">


            <p className="mb-4">
              You are invited to take part in the online study <strong className="text-slate-900">&quot;User Assistance in Exploring Online Reviews: Chatbot vs. ABSA Dashboard&quot;</strong>.
              The study is conducted by Oliver Szczygiel and overseen by Nils Constantin Hellwig at the University of Regensburg.
              We expect about 36 participants. Data collection is planned from 08.06.2026 to 29.06.2026.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
              <h3 className="text-md font-bold text-slate-900 mt-0 mb-3">Key Points:</h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-700 mt-0 mb-0">
                <li><strong>Participation is voluntary:</strong> You may stop at any time without penalty or withdraw your consent.</li>
                <li><strong>Age Requirement:</strong> Participation requires that you are at least 18 years of age.</li>
                <li><strong>Duration:</strong> One session of the online study takes about 40 minutes.</li>
                <li><strong>Compensation:</strong> You will receive VP-Points for participating.</li>
                <li><strong>Demographics:</strong> We collect demographic information (e.g., age and gender) for analysis.</li>
                <li><strong>Data Collection:</strong> The study will collect the following data: your inputs and interactions with the system as well as questionnaire responses.</li>
                <li><strong>Data Integrity:</strong> The study includes quality control measures to ensure data integrity.</li>
                <li><strong>GDPR Compliance:</strong> Recordings and research data are processed in accordance with the GDPR. They will be pseudonymized (using a code), stored, analyzed, and possibly shared publicly as a research dataset, so that no one outside the research team can link the coded data to you without the key.</li>
              </ul>
            </div>

            <p className="mb-6">
              The alternative is not to take part. If you have questions about the study, the consent process, or your rights as a participant, please contact Nils Constantin Hellwig.
              Please read the following information carefully and take the time you need before deciding.
            </p>

            <section className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. Purpose and Goal of this Research</h3>
              <p>
                This study examines how a chatbot and an ABSA dashboard differ in supporting users when exploring online reviews.
                The goal is to evaluate which interface better supports users in terms of task performance and user perception.
                Your participation supports this research. Results may be published in scientific papers, theses, or presented at academic conferences.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. Study Participation</h3>
              <p>
                Your participation in this online study is voluntary. You may skip questions or tasks and stop at any time without penalty and without giving a reason.
                If you feel uncomfortable, you may stop immediately. The researchers may end your participation if this is necessary for organizational reasons,
                because of invalid trials, or for your safety. Repeated participation in this study is not permitted.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. Study Procedure</h3>
              <p className="mb-3">If you agree to participate, the study will usually proceed as follows:</p>
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Introduction, informed consent, and brief demographics questionnaire</li>
                <li>Tutorial explaining the study tasks</li>
                <li>Three randomized conditions with a short questionnaire after each</li>
                <li>Final questionnaire on overall experience and preferences</li>
                <li>Debriefing with study purpose, optional withdrawal, and compensation confirmation</li>
              </ol>
              <p className="mb-4">
                If needed, the researchers can provide confirmation of participation after the study.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">4. Risks and Benefits</h3>
              <p>
                Based on current knowledge, this online study does not involve risks beyond those of everyday activities.
                Despite technical and organizational safeguards, a loss of confidentiality or unauthorized access to data cannot be completely ruled out.
                You are unlikely to receive a direct personal benefit. However, your participation supports research in human-computer interaction.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">5. Data Protection and Confidentiality</h3>
              <p className="mb-4">
                In this study, we collect directly identifying information, where necessary, and research data.
                Processing is based on your consent and carried out in accordance with the General Data Protection Regulation (GDPR).
                You may request access to identifiable data, ask for incorrect information to be corrected, and - where legally possible - request restriction of processing or deletion.
                With your consent, we will collect your input, physiological data, and written notes. Study results may be published in scientific papers or other research reports.
                Directly identifying information will be kept only as long as necessary. It will then be deleted or separated from the research data.
              </p>
              <p className="mb-4">
                During analysis, only the researchers and authorized project staff will have access to the raw data, transcribed interviews, and observation protocols.
                Before sharing or publication, directly identifying information will be removed or changed. The data will be pseudonymized using a code and may then be shared publicly
                for research purposes, so that no one outside the research team can link the coded data to you without the key. Once data or materials have been shared publicly,
                their further distribution cannot be fully undone. Direct quotations or interview content will be prepared for publication so that direct identifiers are removed or changed where possible.
              </p>
              <p className="mb-4">
                Because no contact details are collected, we cannot contact you afterwards about follow-up questions, future studies, or possible data protection incidents.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">6. Identification of Investigators</h3>
              <p className="mb-6">If you have questions about the study or your data, please contact:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h4 className="text-md font-bold text-slate-900 mb-2 mt-0">Research Team</h4>
                  <p className="text-sm text-slate-700 mb-1">
                    <strong>Oliver Szczygiel</strong>
                  </p>
                  <p className="text-sm text-slate-600 mb-3 break-all">
                    oliver.szczygiel@stud.uni-regensburg.de
                  </p>
                  <p className="text-sm text-slate-600">
                    University of Regensburg
                  </p>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                  <h4 className="text-md font-bold text-slate-900 mb-2 mt-0">Principal Investigator</h4>
                  <p className="text-sm text-slate-700 mb-1">
                    <strong>Nils Constantin Hellwig</strong>
                  </p>
                  <p className="text-sm text-slate-600 mb-3 break-all">
                    nils-constantin.hellwig@ur.de
                  </p>
                  <p className="text-sm text-slate-600 leading-snug">
                    University of Regensburg<br />
                    Universitätsstr. 31<br />
                    93053 Regensburg, Germany
                  </p>
                </div>
              </div>
            </section>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-6">
            <button
              onClick={handleConsent}
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-sm transition-colors text-lg"
            >
              {isSubmitting ? 'Processing...' : 'I agree – Continue'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
