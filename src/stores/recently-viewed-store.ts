import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 12;

interface RecentlyViewedState {
  ids: number[];
  add: (id: number) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      add: (id) =>
        set((state) => {
          const next = [id, ...state.ids.filter((item) => item !== id)];
          return { ids: next.slice(0, MAX_RECENT) };
        }),
      clear: () => set({ ids: [] }),
    }),
    { name: "computechs-recent" },
  ),
);
