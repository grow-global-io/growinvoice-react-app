import { createStore } from "zustand/vanilla";

interface TaxCodeStore {
	open: boolean;
	editTaxId: string | null;
	setOpenTaxCodeForm: (open: boolean) => void;
	updateTaxCode: (taxcode: string) => void;
}

export const useCreateTaxCodeStore = createStore<TaxCodeStore>((set) => ({
	open: false,
	editTaxId: null,
	setOpenTaxCodeForm: (open) => {
		set({ open, editTaxId: null });
	},
	updateTaxCode: (taxcode) => {
		set({ editTaxId: taxcode, open: true });
	},
}));
