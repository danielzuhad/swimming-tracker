// store/useAgendaStore.ts
import { TAlat, TGaya, TInternal, TJarak, TVolume } from "@/type/program";
import { zustandStorage } from "@/utils/zustandStorage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Day =
  | "Senin"
  | "Selasa"
  | "Rabu"
  | "Kamis"
  | "Jumat"
  | "Sabtu"
  | "Minggu";

export type TProgramItem = {
  volume: TVolume | null;
  jarak: TJarak | null;
  gaya: TGaya | null;
  alat: TAlat | null;
  interval: TInternal | null;
};

export type TDailyPrograms = {
  warming: TProgramItem[]; //warming up
  main: TProgramItem[];
  sprint: TProgramItem[];
  down: TProgramItem[]; //cooling down
};

export type TWeeklyPrograms = {
  [day in Day]?: TDailyPrograms;
};

type AgendaState = {
  selectedDay: Day;
  setSelectedDay: (day: Day) => void;
  programs: TWeeklyPrograms;
  addProgramItem: (
    day: Day,
    category: keyof TDailyPrograms,
    item: TProgramItem
  ) => void;
  removeProgramItem: (
    day: Day,
    category: keyof TDailyPrograms,
    index: number
  ) => void;
};

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set) => ({
      selectedDay: "Senin",
      setSelectedDay: (day) => set({ selectedDay: day }),
      programs: {
        Senin: {
          warming: [],
          main: [],
          sprint: [],
          down: [],
        },
        Selasa: {
          warming: [],
          main: [],
          sprint: [],
          down: [],
        },
        Rabu: {
          warming: [],
          main: [],
          sprint: [],
          down: [],
        },
        Kamis: {
          warming: [],
          main: [],
          sprint: [],
          down: [],
        },
        Jumat: {
          warming: [],
          main: [],
          sprint: [],
          down: [],
        },
        Sabtu: {
          warming: [],
          main: [],
          sprint: [],
          down: [],
        },
        Minggu: {
          warming: [],
          main: [],
          sprint: [],
          down: [],
        },
      },
      addProgramItem: (day, category, item) =>
        set((state) => {
          const dayPrograms = state.programs[day] ?? {
            warming: [],
            main: [],
            sprint: [],
            down: [],
          };
          const updatedCategory = [...dayPrograms[category], item];
          return {
            programs: {
              ...state.programs,
              [day]: {
                ...dayPrograms,
                [category]: updatedCategory,
              },
            },
          };
        }),
      removeProgramItem: (day, category, index) =>
        set((state) => {
          const dayPrograms = state.programs[day];
          if (!dayPrograms) return state;

          const updatedCategory = dayPrograms[category].filter(
            (_, i) => i !== index
          );

          return {
            programs: {
              ...state.programs,
              [day]: {
                ...dayPrograms,
                [category]: updatedCategory,
              },
            },
          };
        }),
    }),
    {
      name: "agenda-storage",
      storage: zustandStorage,
    }
  )
);
