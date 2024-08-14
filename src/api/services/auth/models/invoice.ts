/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Growinvoice API
 * Enhance your business with Growinvoice API
 * OpenAPI spec version: 1.0
 */
import type { Customer } from "./customer";
import type { InvoicePaidStatus } from "./invoicePaidStatus";
import type { InvoicePayment } from "./invoicePayment";
import type { InvoiceRecurring } from "./invoiceRecurring";
import type { InvoiceTax } from "./invoiceTax";
import type { InvoiceTemplateProperty } from "./invoiceTemplateProperty";
import type { User } from "./user";

export interface Invoice {
	createdAt: string;
	customer?: Customer;
	customer_id: string;
	date: string;
	/** @nullable */
	discountPercentage: number | null;
	due_amount: number;
	due_date: string;
	id: string;
	invoice_number: string;
	is_recurring: boolean;
	isExist: boolean;
	/** @nullable */
	notes: string | null;
	paid_amount: number;
	paid_status: InvoicePaidStatus;
	/** @nullable */
	payment?: InvoicePayment;
	/** @nullable */
	paymentId: string | null;
	/** @nullable */
	recurring: InvoiceRecurring;
	/** @nullable */
	reference_number: string | null;
	/** @nullable */
	status: string | null;
	sub_total: number;
	/** @nullable */
	tax?: InvoiceTax;
	/** @nullable */
	tax_id: string | null;
	/** @nullable */
	template?: InvoiceTemplateProperty;
	/** @nullable */
	template_id: string | null;
	/** @nullable */
	template_url: string | null;
	total: number;
	/** @nullable */
	updatedAt: string | null;
	user?: User;
	user_id: string;
}
