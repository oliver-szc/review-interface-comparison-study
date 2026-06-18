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
}

export function InformationNeedBanner({
  task,
  onHelp = () => { },
  onSubmit = () => { },
  submitContent,
  helpContent,
  productId,
}: InformationNeedBannerProps) {
  const { waitingForAction, dispatchTutorialAction } = useTutorial();
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
                    <h3 className="text-xl font-bold text-slate-950 mb-3">
                      Help / Task Instructions
                    </h3>
                    <span className="text-slate-700 text-sm md:text-base leading-relaxed mb-3">Imagine following: You are interested in buying this {(productId || 'product').toLowerCase()} and want to evaluate claims you have heard about the product.</span> <br />
                    <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-3">
                      Your goal is to verify three specific claims about the product using the provided system (chatbot, dashboard, or reviews only). Please investigate whether the experiences of actual customers support or contradict these claims.
                    </p>

                    <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-3">
                      Click on <strong>Open Answer Form</strong> to view the claims. For each claim, select one of the following options based on the evidence you found:
                    </p>

                    <ul className="list-disc pl-5 mb-6 space-y-2 text-slate-700 text-sm md:text-base leading-relaxed">
                      <li><span className="font-semibold">True </span>(the majority of reviewers clearly rate this aspect as such)</li>
                      <li><span className="font-semibold">False </span>(the aspect is mentioned, but the majority rate it the opposite way)</li>
                      <li><span className="font-semibold">Not mentioned </span>(cannot be determined because the reviews do not address this aspect)</li>
                    </ul>

                    <div className="p-5 bg-white border border-slate-200 rounded-lg text-slate-700">
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 mb-2.5">
                        Remember:
                      </h4>
                      <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm leading-relaxed">
                        <li><strong>Use the provided system:</strong> Solve the task using the system currently visible on your screen.</li>
                        <li><strong>Stay focused:</strong> Please do not switch browser tabs or take breaks while the time is running.</li>
                        <li><strong>Complete the form:</strong> You must select an answer for all three claims before you can submit.</li>
                      </ul>
                    </div>
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
