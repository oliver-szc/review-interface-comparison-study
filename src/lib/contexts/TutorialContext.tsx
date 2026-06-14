'use client';

import { createContext, useContext, ReactNode } from 'react';

interface TutorialContextType {
  currentStep: number;
  waitingForAction: string | null;
  dispatchTutorialAction: (action: string) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ 
  children, 
  currentStep = 0,
  waitingForAction = null,
  onAction 
}: { 
  children: ReactNode; 
  currentStep?: number;
  waitingForAction?: string | null;
  onAction: (action: string) => void; 
}) {
  return (
    <TutorialContext.Provider value={{ currentStep, waitingForAction, dispatchTutorialAction: onAction }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    // If not within a provider, return a no-op function and step 0 so it doesn't break outside the tutorial
    return { currentStep: 0, waitingForAction: null, dispatchTutorialAction: () => {} };
  }
  return context;
}
