/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Growinvoice API
 * Enhance your business with Growinvoice API
 * OpenAPI spec version: 1.0
 */
import type { UpdateExpensesDtoCategory } from "./updateExpensesDtoCategory";

export interface UpdateExpensesDto {
	amount?: number;
	category?: UpdateExpensesDtoCategory;
	currency_id?: string;
	expenseDate?: string;
	/** @nullable */
	notes?: string | null;
	/** @nullable */
	receipt_url?: string | null;
	user_id?: string;
	vendor_id?: string;
}
