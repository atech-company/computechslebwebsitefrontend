import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  ids: number[];
  add: (id: number) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
  has: (id: number) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) =>
        set((state) =>
          state.ids.includes(id) ? state : { ids: [...state.ids, id] },
        ),
      remove: (id) =>
        set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
      toggle: (id) => {
        if (get().has(id)) get().remove(id);
        else get().add(id);
      },
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: "computechs-wishlist" },
  ),
);
