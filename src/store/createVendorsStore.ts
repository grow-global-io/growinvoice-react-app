import { createStore } from "zustand/vanilla";

interface PaymentStore {
	open: boolean;
	editVendorId: string | null;
	setOpenVendorsForm: (open: boolean) => void;
	updateVendors: (vendor_id: string) => void;
}

export const useCreateVendorsStore = createStore<PaymentStore>((set) => ({
	open: false,
	editVendorId: null,
	setOpenVendorsForm: (open) => {
		set({ open, editVendorId: null });
	},
	updateVendors: (vendors) => {
		set({ editVendorId: vendors, open: true });
	},
}));
