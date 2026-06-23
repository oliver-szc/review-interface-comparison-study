'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { useTutorial } from '@/lib/contexts/TutorialContext';
import { TutorialHighlight } from '@/components/tutorial/TutorialHighlight';

interface InformationNeedBannerProps {
  task: ReactNode | ((props: { isOpen: boolean }) => ReactNode);
  onHelp?: () => void;
  onSubmit?: () => void;
  submitContent?: ReactNode;
  helpContent?: ReactNode;
  productId?: string;
  conditionType?: 'BASELINE' | 'DASHBOARD' | 'CHATBOT' | 'TUTORIAL';
}

export function InformationNeedBanner({
  task,
  onHelp = () => { },
  onSubmit = () => { },
  submitContent,
  helpContent,
  productId,
  conditionType,
}: InformationNeedBannerProps) {
  const { currentStep, waitingForAction, dispatchTutorialAction } = useTutorial();
  const [activeTab, setActiveTab] = useState<'help' | 'submit' | null>(null);
  const [renderedTab, setRenderedTab] = useState<'help' | 'submit' | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab !== null) {
      setRenderedTab(activeTab);
    } else {
      const timer = setTimeout(() => {
        setRenderedTab(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const isOpen = activeTab !== null;
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && headerRef.current) {
      const height = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--banner-height', `${height}px`);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (headerRef.current && !isOpenRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--banner-height', `${height}px`);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && window.ResizeObserver && headerRef.current) {
      resizeObserver = new window.ResizeObserver(handleResize);
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  let activeAssistance: 'REVIEWS' | 'CHATBOT' | 'DASHBOARD' | null = null;
  if (conditionType === 'BASELINE') {
    activeAssistance = 'REVIEWS';
  } else if (conditionType === 'CHATBOT') {
    activeAssistance = 'CHATBOT';
  } else if (conditionType === 'DASHBOARD') {
    activeAssistance = 'DASHBOARD';
  } else if (conditionType === 'TUTORIAL') {
    if (currentStep < 3) {
      activeAssistance = 'REVIEWS';
    } else if (currentStep === 3 || currentStep === 4) {
      activeAssistance = 'CHATBOT';
    } else {
      activeAssistance = 'DASHBOARD';
    }
  }

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setActiveTab(null)}
      />

      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-100 border-b border-slate-200 rounded-b-xl shadow-sm flex flex-col overflow-hidden transition-all duration-500 ease-in-out">

        {/* Top Header Row (Always visible) */}
        <div ref={headerRef} className="flex-shrink-0 flex items-center justify-between px-10 py-2 min-h-20">
          <div className="w-56 flex justify-start flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('help')}
              className={`flex-shrink-0 flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg pl-[10px] pr-[14px] py-[9px] transition shadow-sm ${isOpen ? 'invisible pointer-events-none' : 'visible'}`}
            >
              <span className="material-symbols-outlined">help</span> Open Help
            </button>
          </div>

          <div className="text-xs text-slate-700 font-medium text-center max-w-2xl leading-snug px-4 py-1 flex flex-col justify-center">
            {typeof task === 'function' ? task({ isOpen }) : task}
          </div>

          <div className="w-56 flex justify-end flex-shrink-0">
            <TutorialHighlight
              active={waitingForAction === 'OPEN_ANSWER_FORM'}
              roundedClass="rounded-lg"
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab('submit');
                  dispatchTutorialAction('OPEN_ANSWER_FORM');
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg pl-[10px] pr-[12px] py-[9px] transition shadow-sm ${isOpen ? 'invisible pointer-events-none' : 'visible'}`}
              >
                <span className="material-symbols-outlined">expand_circle_down</span> Open Answer Form
              </button>
            </TutorialHighlight>
          </div>
        </div>

        {/* Expanded Content Area */}
        <div
          className={`w-full grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
        >
          <div className="min-h-0 overflow-hidden w-full flex flex-col items-center">
            {/* Scrollable interior - disabled scrollability, enabled flexible auto-sizing */}
            <div className="w-full flex-1 overflow-y-auto px-6 py-4 flex flex-col items-center max-h-[75vh] [scrollbar-gutter:stable]">
              {renderedTab === 'help' && (
                helpContent || (
                  <div className="w-full max-w-4xl text-left">
                    <h2 className="text-3xl font-bold text-slate-950 mb-4">
                      Help
                    </h2>
                    <h4 className="text-lg font-bold text-slate-950 mb-3">How it works:</h4>
                    <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-4">
                      You are evaluating three claims about a product using customer reviews. Your goal is to decide for each claim whether the reviews support or contradict it.
                    </p>
                    <ol className="list-decimal pl-5 mb-6 space-y-2 text-slate-700 text-sm md:text-base leading-relaxed">
                      <li><strong>Explore</strong> the reviews using the tool on your screen.</li>
                      <li><strong>Open the answer form</strong> and mark each claim as <em>True</em>, <em>False</em>, or <em>Not mentioned</em>.</li>
                      <li><strong>Submit</strong> once all three claims are answered.</li>
                    </ol>

                    <h4 className="text-lg font-bold text-slate-950 mb-3">Tips:</h4>
                    <ul className="list-disc pl-5 mb-8 space-y-2 text-slate-700 text-sm md:text-base leading-relaxed">
                      <li>Base your answers on what the <strong>majority</strong> of reviewers say, not on individual cases.</li>
                      <li>If you searched for a topic but found no relevant reviews, select <em>Not mentioned</em>.</li>
                      <li>You can open and close the answer form at any time — your progress is saved.</li>
                    </ul>

                    {activeAssistance === 'REVIEWS' && (
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                        <h4 className="text-lg font-bold text-slate-950 mb-3">
                          Current Assistance in Detail: Reviews
                        </h4>
                        <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-3">
                          In the Reviews section, you’ll see the complete list of all customer reviews. Here, you can:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm md:text-base leading-relaxed">
                          <li>scroll through all reviews, just like on a regular product page</li>
                          <li>sort the reviews, for example by highest ratings</li>
                          <li>filter the reviews using a keyword search to see only specific topics</li>
                        </ul>
                        <p className="text-slate-700 text-sm md:text-base leading-relaxed mt-4 font-semibold">
                          This helps you to read exactly what individual people have written.
                        </p>
                      </div>
                    )}

                    {activeAssistance === 'CHATBOT' && (
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                        <h4 className="text-lg font-bold text-slate-950 mb-3">
                          Current Assistance in Detail: Chatbot
                        </h4>
                        <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-3">
                          The chatbot is a text-based assistant that lets you “talk” about the reviews. Instead of searching through all the text yourself, here you can:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm md:text-base leading-relaxed">
                          <li>ask specific questions, such as “Do customers mention battery life?”</li>
                          <li>get summaries or specific insights based on the existing reviews</li>
                        </ul>
                        <p className="text-slate-700 text-sm md:text-base leading-relaxed mt-4 font-semibold">
                          The chatbot helps you get an overview more quickly or find out specific details without having to read every review individually.
                        </p>
                      </div>
                    )}

                    {activeAssistance === 'DASHBOARD' && (
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                        <h4 className="text-lg font-bold text-slate-950 mb-3">
                          Current Assistance in Detail: Dashboard
                        </h4>
                        <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-3">
                          The dashboard summarizes the reviews into categories. Instead of reading many individual texts, you get a structured overview. There, you can:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm md:text-base leading-relaxed">
                          <li>see which categories appear in the reviews (e.g., “quality,” “usability,” “delivery”)</li>
                          <li>view reviews within a category to read the details</li>
                          <li>identify key points or highlights, such as aspects that are frequently praised or criticized</li>
                        </ul>
                        <p className="text-slate-700 text-sm md:text-base leading-relaxed mt-4 font-semibold">
                          The dashboard helps you to understand which topics dominate the reviews and what the opinions are on them.
                        </p>
                      </div>
                    )}
                  </div>

                )
              )}
              {renderedTab === 'submit' && (
                submitContent || (
                  <div className="text-slate-800 text-sm">
                    Submit content goes here...
                  </div>
                )
              )}
            </div>

            {/* Fixed bottom controls */}
            <div className="w-full flex-shrink-0 flex justify-center py-3">
              <button
                type="button"
                onClick={() => setActiveTab(null)}
                className={`flex-shrink-0 flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg py-[9px] transition shadow-sm ${renderedTab === 'help' ? 'pl-[10px] pr-[14px]' : 'pl-[10px] pr-[12px]'
                  }`}
              >
                {renderedTab === 'help' ? (
                  <>
                    <span className="material-symbols-outlined">expand_circle_up</span> Close Help
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">expand_circle_up</span> Close Answer Form
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
