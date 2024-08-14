import { createStore } from "zustand/vanilla";

interface VendorViewStore {
	open: boolean;
	VendorId: string | null;
	openVendorsView: (VendorId: string) => void;
}

export const useCreateVendorsViewStore = createStore<VendorViewStore>((set) => ({
	open: false,
	VendorId: null,
	openVendorsView: (vendorsview) => {
		set({ VendorId: vendorsview, open: true });
	},
}));
