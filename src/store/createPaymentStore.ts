import { createStore } from "zustand/vanilla";

interface PaymentStore {
	open: boolean;
	setOpenPaymentForm: (open: boolean) => void;
	invoiceId: string | null;
	setOpenPaymentFormWithInvoiceId: (open: boolean, invoiceId: string) => void;
}

export const useCreatePaymentStore = createStore<PaymentStore>((set) => ({
	open: false,
	invoiceId: null,
	setOpenPaymentForm: (open) => {
		set({ open });
	},
	setOpenPaymentFormWithInvoiceId: (open, invoiceId) => {
		set({ open, invoiceId });
	},
}));
