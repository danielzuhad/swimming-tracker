import { create } from "zustand";

type Lap = {
  time: number;
  style: string;
  volume: string;
};

type StopwatchState = {
  results: Record<string, Lap[]>;
  setLaps: (key: string, laps: Lap[]) => void;
  resetAll: () => void;
};

export const useStopwatchStore = create<StopwatchState>((set) => ({
  results: {},
  setLaps: (key, laps) =>
    set((state) => ({
      results: {
        ...state.results,
        [key]: laps,
      },
    })),
  resetAll: () => set({ results: {} }),
}));
