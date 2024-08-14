import { GetCustomerWithAddressDto } from "@api/services/models";
import { createStore } from "zustand/vanilla";

interface CustomerStore {
	open: boolean;
	editValues: GetCustomerWithAddressDto | null;
	setOpenCustomerForm: (open: boolean) => void;
	updateCustomer: (customer: GetCustomerWithAddressDto) => void;
}

export const useCreateCustomerStore = createStore<CustomerStore>((set) => ({
	open: false,
	editValues: null,
	setOpenCustomerForm: (open) => {
		set({ open, editValues: null });
	},
	updateCustomer: (customer) => {
		set({ editValues: customer, open: true });
	},
}));
