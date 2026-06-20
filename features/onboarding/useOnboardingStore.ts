import { create } from "zustand";
import { defaultOnboardingData, type OnboardingData } from "@/types/onboarding";

interface OnboardingStore {
  data: OnboardingData;
  setData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  data: { ...defaultOnboardingData },
  setData: (partial) =>
    set((state) => ({ data: { ...state.data, ...partial } })),
  reset: () =>
    set({ data: { ...defaultOnboardingData } }),
}));
