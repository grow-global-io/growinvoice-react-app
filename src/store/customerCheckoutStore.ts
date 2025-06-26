import { create } from "zustand";

interface CustomerCheckoutStore {
	open: boolean;
	setOpenCheckoutForm: (open: boolean) => void;
}

export const useCustomerCheckoutStore = create<CustomerCheckoutStore>((set) => ({
	open: false,
	setOpenCheckoutForm: (open) => set({ open }),
}));
