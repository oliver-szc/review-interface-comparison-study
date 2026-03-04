import { create } from 'zustand';

interface SessionState {
  currentConditionIndex: number;
  completedPhases: string[];
  setCurrentConditionIndex: (index: number) => void;
  setCompletedPhases: (phases: string[]) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentConditionIndex: 0,
  completedPhases: [],
  setCurrentConditionIndex: (index) => set(() => ({ currentConditionIndex: index })),
  setCompletedPhases: (phases) => set(() => ({ completedPhases: phases })),
}));
