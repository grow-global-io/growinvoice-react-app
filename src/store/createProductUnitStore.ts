import { createStore } from "zustand/vanilla";

interface ProductUnitStore {
	open: boolean;
	editProductUnitId: string | null;
	setOpenProductUnitForm: (open: boolean) => void;
	updateProductUnit: (productunit: string) => void;
}

export const useCreateProductUnitStore = createStore<ProductUnitStore>((set) => ({
	open: false,
	editProductUnitId: null,
	setOpenProductUnitForm: (open) => {
		set({ open, editProductUnitId: null });
	},
	updateProductUnit: (productunit) => {
		set({ editProductUnitId: productunit, open: true });
	},
}));
