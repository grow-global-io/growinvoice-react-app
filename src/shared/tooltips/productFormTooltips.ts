/**
 * Tooltip information for Product Form fields
 * These tooltips provide helpful guidance for users filling out the product form
 */

export interface TooltipInfo {
	key: string;
	titleKey: string;
	descriptionKey: string;
}

export const productFormTooltips: Record<string, TooltipInfo> = {
	type: {
		key: "type",
		titleKey: "tooltips.productForm.type.title",
		descriptionKey: "tooltips.productForm.type.description",
	},
	name: {
		key: "name",
		titleKey: "tooltips.productForm.name.title",
		descriptionKey: "tooltips.productForm.name.description",
	},
	includeStore: {
		key: "includeStore",
		titleKey: "tooltips.productForm.includeStore.title",
		descriptionKey: "tooltips.productForm.includeStore.description",
	},
	images: {
		key: "images",
		titleKey: "tooltips.productForm.images.title",
		descriptionKey: "tooltips.productForm.images.description",
	},
	unit_id: {
		key: "unit_id",
		titleKey: "tooltips.productForm.unit_id.title",
		descriptionKey: "tooltips.productForm.unit_id.description",
	},
	hsnCode_id: {
		key: "hsnCode_id",
		titleKey: "tooltips.productForm.hsnCode_id.title",
		descriptionKey: "tooltips.productForm.hsnCode_id.description",
	},
	tax: {
		key: "tax",
		titleKey: "tooltips.productForm.tax.title",
		descriptionKey: "tooltips.productForm.tax.description",
	},
	currency_id: {
		key: "currency_id",
		titleKey: "tooltips.productForm.currency_id.title",
		descriptionKey: "tooltips.productForm.currency_id.description",
	},
	price: {
		key: "price",
		titleKey: "tooltips.productForm.price.title",
		descriptionKey: "tooltips.productForm.price.description",
	},
	sellPrice: {
		key: "sellPrice",
		titleKey: "tooltips.productForm.sellPrice.title",
		descriptionKey: "tooltips.productForm.sellPrice.description",
	},
	shippingCharges: {
		key: "shippingCharges",
		titleKey: "tooltips.productForm.shippingCharges.title",
		descriptionKey: "tooltips.productForm.shippingCharges.description",
	},
	description: {
		key: "description",
		titleKey: "tooltips.productForm.description.title",
		descriptionKey: "tooltips.productForm.description.description",
	},
};
