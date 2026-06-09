import { create } from 'zustand';

interface DashboardFilterState {
  activeAspect: string | null;
  setActiveAspect: (category: string | null) => void;
}

export const useDashboardFilterStore = create<DashboardFilterState>((set) => ({
  activeAspect: null,
  setActiveAspect: (category) => set({ activeAspect: category }),
}));
