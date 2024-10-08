/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Growinvoice API
 * Enhance your business with Growinvoice API
 * OpenAPI spec version: 1.0
 */
import type { OmitCreateQuotationProductsDto } from "./omitCreateQuotationProductsDto";

export interface CreateQuotationWithProducts {
	customer_id: string;
	date: string;
	/** @nullable */
	discountPercentage?: number | null;
	expiry_at: string;
	/** @nullable */
	notes?: string | null;
	/** @nullable */
	private_notes?: string | null;
	product: OmitCreateQuotationProductsDto[];
	quatation_number: string;
	/** @nullable */
	reference_number?: string | null;
	/** @nullable */
	status?: string | null;
	sub_total: number;
	/** @nullable */
	tax_id?: string | null;
	/** @nullable */
	template_id?: string | null;
	/** @nullable */
	template_url?: string | null;
	total: number;
	user_id: string;
}
