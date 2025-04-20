import { IUser } from "@/type/user";
import { zustandStorage } from "@/utils/zustandStorage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UsersState = {
  users: IUser[];
  setUsers: (users: IUser[]) => void;
  addUser: (user: IUser) => void;
  removeUserById: (id: string | number) => void;
  clearUsers: () => void;
};

const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      setUsers: (users) => set({ users }),
      addUser: (user) => {
        const existing = get().users.find((u) => u.id === user.id);
        if (!existing) {
          set((state) => ({ users: [...state.users, user] }));
        }
      },
      removeUserById: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),
      clearUsers: () => set({ users: [] }),
    }),
    {
      name: "users-storage",
      storage: zustandStorage,
    }
  )
);

export default useUsersStore;
