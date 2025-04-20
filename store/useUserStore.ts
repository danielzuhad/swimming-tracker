import { IUser } from "@/type/user";
import { zustandStorage } from "@/utils/zustandStorage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type IState = {
  user: IUser | null;
  setUser: (user: IUser) => void;
};

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user: IUser) => set({ user }),
    }),
    {
      name: "user-storage",
      storage: zustandStorage,
    }
  )
);

export default useUserStore;
