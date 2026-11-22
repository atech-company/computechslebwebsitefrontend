import { create } from "zustand";

interface UiState {
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  toggleCartDrawer: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  cartDrawerOpen: false,
  setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
  toggleCartDrawer: () =>
    set((state) => ({ cartDrawerOpen: !state.cartDrawerOpen })),
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
