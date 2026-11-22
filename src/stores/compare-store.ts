import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_COMPARE = 4;

interface CompareState {
  ids: number[];
  add: (id: number) => boolean;
  remove: (id: number) => void;
  toggle: (id: number) => boolean;
  has: (id: number) => boolean;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) => {
        const { ids } = get();
        if (ids.includes(id)) return true;
        if (ids.length >= MAX_COMPARE) return false;
        set({ ids: [...ids, id] });
        return true;
      },
      remove: (id) =>
        set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
      toggle: (id) => {
        if (get().has(id)) {
          get().remove(id);
          return true;
        }
        return get().add(id);
      },
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: "computechs-compare" },
  ),
);
