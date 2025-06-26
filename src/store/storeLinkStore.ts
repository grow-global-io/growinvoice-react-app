import { create } from "zustand";

interface StoreLinkStore {
	open: boolean;
	handleOpen: () => void;
	handleClose?: () => void;
}

export const useStoreLinkStore = create<StoreLinkStore>((set) => ({
	open: false,
	handleOpen: () => set({ open: true }),
	handleClose: () => set({ open: false }),
}));
