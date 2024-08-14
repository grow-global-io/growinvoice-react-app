import { createStore } from "zustand/vanilla";

interface HsnCodeStore {
	open: boolean;
	editHsnCodeId: string | null;
	setOpenHsnCodeForm: (open: boolean) => void;
	updateHsnCode: (hsncode: string) => void;
}

export const useCreateHsnCodeStore = createStore<HsnCodeStore>((set) => ({
	open: false,
	editHsnCodeId: null,
	setOpenHsnCodeForm: (open) => {
		set({ open, editHsnCodeId: null });
	},
	updateHsnCode: (hsncode) => {
		set({ editHsnCodeId: hsncode, open: true });
	},
}));
