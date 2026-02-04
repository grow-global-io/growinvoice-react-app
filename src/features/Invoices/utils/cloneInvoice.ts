import type { CreateInvoiceWithProducts } from "@api/services/models";
import type { InvoiceWithAllDataDto } from "@api/services/models";
import { CreateInvoiceWithProductsRecurring } from "@api/services/models";

/**
 * Builds a create-invoice payload from an existing invoice for cloning.
 * The new invoice will have the same data but a different invoice number (assigned by backend or placeholder).
 */
export function buildClonePayload(invoice: InvoiceWithAllDataDto): CreateInvoiceWithProducts {
	const product = (invoice.product ?? []).map((p) => ({
		product_id: p.product_id,
		quantity: p.quantity,
		price: p.price,
		total: p.total,
		hsnCode_id: p.hsnCode_id ?? undefined,
		taxes: p.tax_forInvoiceProducts?.map((t) => t.tax_id) ?? [],
		discount: p.discount ?? undefined,
	}));

	return {
		user_id: invoice.user_id,
		customer_ids: [invoice.customer_id],
		currency_id: invoice.currency_id ?? undefined,
		date: invoice.date,
		due_date: invoice.due_date,
		invoice_number: `Copy-${invoice.invoice_number}-${Date.now()}`,
		reference_number: invoice.reference_number ?? undefined,
		notes: invoice.notes ?? undefined,
		paymentId: invoice.paymentId ?? undefined,
		status: invoice.status ?? undefined,
		template_id: invoice.template_id ?? undefined,
		template_url: invoice.template_url ?? undefined,
		tax_id: invoice.tax_id ?? undefined,
		fromStore: invoice.fromStore,
		is_recurring: invoice.is_recurring,
		recurring: invoice.recurring ?? CreateInvoiceWithProductsRecurring.Daily,
		termsAccepted: invoice.termsAccepted,
		sub_total: invoice.sub_total,
		total: invoice.total,
		paid_amount: 0,
		due_amount: invoice.total,
		discountPercentage: invoice.discountPercentage ?? undefined,
		product,
	};
}
