import { ProductDto } from "@api/services/models";
import { createStore } from "zustand/vanilla";

interface ProductStore {
	open: boolean;
	editValues: ProductDto | null;
	setOpenProductForm: (open: boolean) => void;
	updateProduct: (product: ProductDto) => void;
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
