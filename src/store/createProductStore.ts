import { ProductWithAllDataDto } from "@api/services/models";
import { createStore } from "zustand/vanilla";

interface ProductStore {
	open: boolean;
	editValues: ProductWithAllDataDto | null;
	setOpenProductForm: (open: boolean) => void;
	updateProduct: (product: ProductWithAllDataDto) => void;
}

export const useCreateProductStore = createStore<ProductStore>((set) => ({
	open: false,
	editValues: null,
	setOpenProductForm: (open) => {
		set({ open, editValues: null });
	},
	updateProduct: (product) => {
		set({ editValues: product, open: true });
	},
}));
