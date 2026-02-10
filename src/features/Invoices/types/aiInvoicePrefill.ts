/**
 * Data passed from Your AI chat to pre-fill the Create Invoice form.
 */
export interface AiInvoicePrefill {
	customer_ids: string[];
	paymentId: string;
	template_id: string;
	currency_id: string;
	date: string;
	due_date: string;
	invoice_number: string;
	reference_number?: string;
	notes?: string;
	sub_total: number;
	total: number;
	paid_amount?: number;
	due_amount?: number;
	rows: Array<{
		id: string;
		product_id: string;
		/** Optional display name fallback for the product cell */
		product_name?: string;
		quantity: number;
		price: number;
		total: number;
		taxes?: string[];
		discount?: number;
	}>;
}
