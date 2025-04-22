import { IUser } from "@/type/user";
import { zustandStorage } from "@/utils/zustandStorage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TProgramItem } from "./useAgendaStore";

export interface ITrainingRecord {
  date: string; // Format: "YYYY-MM-DD"
  program: TProgramItem; // Program sprint yang dilakukan
  fiftyValue: number;
  hundredValue: number;
}

type UsersState = {
  users: IUser[];
  setUsers: (users: IUser[]) => void;
  addUser: (user: IUser) => void;
  removeUserById: (id: string | number) => void;
  clearUsers: () => void;
  addTrainingRecord: (userId: string | number, record: ITrainingRecord) => void;
  getTrainingRecords: (userId: string) => ITrainingRecord[];
};

const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      setUsers: (users) => set({ users }),
      addUser: (user) => {
        const existing = get().users.find((u) => u.id === user.id);
        if (!existing) {
          set((state) => ({
            users: [...state.users, { ...user, trainingRecords: [] }],
          }));
        }
      },
      removeUserById: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),
      clearUsers: () => set({ users: [] }),
      addTrainingRecord: (userId, record) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  trainingRecords: [...(user.trainingRecords || []), record],
                }
              : user
          ),
        })),
      getTrainingRecords: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        return user?.trainingRecords || [];
      },
    }),
    {
      name: "users-storage",
      storage: zustandStorage,
    }
  )
);

export default useUsersStore;
