// src/store/productCheckoutStore.ts

// 1. Change this import from 'zustand/vanilla' to 'zustand'
import { create } from "zustand";
import { ProductWithAllDataDto } from "../api/services/auth/models";

interface ProductCheckoutStore {
	open: boolean;
	setOpenCheckoutForm: (open: boolean) => void;
	checkoutProducts: (ProductWithAllDataDto & {
		quantity: number;
		totalPrice: number; // Optional, can be calculated based on quantity and price
	})[];
	addProductToCheckout: (product: ProductWithAllDataDto) => void;
	removeProductFromCheckout: (productId: string) => void;
	removeAllProductsFromCheckout?: () => void; // Optional, can be used to clear all products
	clearCheckoutProducts: () => void;
	currencyCode: string; // Made non-optional for simplicity, as it has a default.
	setCurrencyCode: (code: string) => void; // Made non-optional
	changeQuantity: (productId: string, quantity: number) => void;
	searchTerm?: string; // Optional search term for filtering products
	handleSearchChange?: (searchTerm: string) => void; // Optional function to handle search term changes
}

// 2. Change createStore to create. Now this variable is a ready-to-use hook.
export const useProductCheckoutStore = create<ProductCheckoutStore>((set) => ({
	open: false,
	setOpenCheckoutForm: (open) => set({ open }),
	checkoutProducts: [],
	addProductToCheckout: (product) => {
		const price =
			product?.priceBook?.find((price) => price.currency?.short_code === "INR")?.price || 0;
		const taxPercentage =
			product?.tax?.reduce((acc, tax) => acc + (tax?.tax?.percentage || 0), 0) || 0;
		const tax = (price * taxPercentage) / 100; // Calculate tax based on the price and tax percentage
		const totalPrice = price + tax; // Total price including tax
		set((state) => ({
			checkoutProducts: [...state.checkoutProducts, { ...product, quantity: 1, totalPrice }],
		}));
	},
	removeProductFromCheckout: (productId) =>
		set((state) => ({
			checkoutProducts: state.checkoutProducts.filter((product) => product.id !== productId),
		})),
	removeAllProductsFromCheckout: () => set({ checkoutProducts: [] }), // Optional function to clear all products

	clearCheckoutProducts: () => set({ checkoutProducts: [] }),
	currencyCode: "INR", // Default currency code
	setCurrencyCode: (code) => set({ currencyCode: code }),
	changeQuantity: (productId, quantity) => {
		const product = useProductCheckoutStore
			.getState()
			.checkoutProducts.find((p) => p.id === productId);
		if (!product) return; // If product not found, do nothing
		const price =
			product?.priceBook?.find((price) => price.currency?.short_code === "INR")?.price || 0;
		const taxPercentage =
			product?.tax?.reduce((acc, tax) => acc + (tax?.tax?.percentage || 0), 0) || 0;
		const tax = (price * taxPercentage) / 100; // Calculate tax based on the price
		const totalPrice = (price + tax) * quantity; // Total price including tax and multiplied by quantity
		set((state) => ({
			checkoutProducts: state.checkoutProducts.map((product) =>
				product.id === productId ? { ...product, quantity, totalPrice } : product,
			),
		}));
	},
	searchTerm: undefined, // Optional search term
	handleSearchChange: (searchTerm) => {
		set({ searchTerm });
	},
}));
