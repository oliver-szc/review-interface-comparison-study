'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';

interface InformationNeedBannerProps {
  task: ReactNode | ((props: { isOpen: boolean }) => ReactNode);
  onHelp?: () => void;
  onSubmit?: () => void;
  submitContent?: ReactNode;
  helpContent?: ReactNode;
}

export function InformationNeedBanner({
  task,
  onHelp = () => { },
  onSubmit = () => { },
  submitContent,
  helpContent,
}: InformationNeedBannerProps) {
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

  useEffect(() => {
    const handleResize = () => {
      if (headerRef.current) {
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

  const isOpen = activeTab !== null;

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
          <div className="w-48 flex justify-start flex-shrink-0">
            {!isOpen && (
              <button
                type="button"
                onClick={() => setActiveTab('help')}
                className="flex-shrink-0 flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg px-[18px] py-[9px] transition shadow-sm"
              >
                <span>?</span> Open Help
              </button>
            )}
          </div>

          <div className="text-xs text-slate-700 font-medium text-center max-w-2xl leading-snug px-4 py-1 flex flex-col justify-center">
            {typeof task === 'function' ? task({ isOpen }) : task}
          </div>

          <div className="w-48 flex justify-end flex-shrink-0">
            {!isOpen && (
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className="flex-shrink-0 flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg px-[18px] py-[9px] transition shadow-sm"
              >
                ✓ Open Answer Form
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content Area */}
        <div
          className={`w-full overflow-hidden transition-all duration-500 ease-in-out flex flex-col items-center ${isOpen ? 'max-h-[75vh] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          {/* Scrollable interior - disabled scrollability, enabled flexible auto-sizing */}
          <div className="w-full flex-1 overflow-hidden px-6 py-4 flex flex-col items-center">
            {renderedTab === 'help' && (
              helpContent || (
                <div className="w-full max-w-4xl text-left bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-950 mb-3">
                    Help / Task Instructions
                  </h3>

                  <p className="text-slate-700 text-xs md:text-sm leading-relaxed mb-3">
                    Your goal is to verify three specific claims about the product using the provided system (AI Chatbot, Interactive Dashboard, or Reviews Only). Please investigate whether the experiences of actual customers support or contradict these claims.
                  </p>

                  <p className="text-slate-700 text-xs md:text-sm leading-relaxed mb-6">
                    Click on <strong>Open Answer Form</strong> to view the claims. For each claim, select one of the following options based on the evidence you found:
                  </p>

                  <div className="mb-6 space-y-3">
                    <div className="flex gap-3">
                      <span className="font-bold text-slate-900 text-xs md:text-sm w-30 shrink-0">True:</span>
                      <span className="text-slate-700 text-xs md:text-sm">The majority of customer reviews clearly support the claim.</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-bold text-slate-900 text-xs md:text-sm w-30 shrink-0">False:</span>
                      <span className="text-slate-700 text-xs md:text-sm">The majority of customer reviews clearly contradict the claim.</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-bold text-slate-900 text-xs md:text-sm w-30 shrink-0">Not mentioned<br />in the reviews:</span>
                      <span className="text-slate-700 text-xs md:text-sm">There is not enough information or no clear consensus in the reviews regarding this specific claim.</span>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 mb-2.5">
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
                <div className="text-slate-1000 text-sm">
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
              className="px-[18px] py-[9px] border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition shadow-sm"
            >
              {renderedTab === 'help' ? 'Close Help' : 'Close Answer Form'}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
