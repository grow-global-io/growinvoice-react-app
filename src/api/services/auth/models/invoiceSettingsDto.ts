/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Growinvoice API
 * Enhance your business with Growinvoice API
 * OpenAPI spec version: 1.0
 */

export interface InvoiceSettingsDto {
	autoArchive: boolean;
	companyAddressTemplate: string;
	createdAt: string;
	customerBillingAddressTemplate: string;
	customerShippingAddressTemplate: string;
	dueNotice: number;
	/** @nullable */
	footer: string | null;
	id: string;
	invoicePrefix: string;
	invoiceTemplateId: string;
	isExist: boolean;
	/** @nullable */
	notes: string | null;
	overDueNotice: number;
	/** @nullable */
	updatedAt: string | null;
	user_id: string;
}
