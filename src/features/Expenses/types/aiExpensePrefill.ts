import type { CreateExpensesDto } from "@api/services/models";

/**
 * Data passed from Your AI chat to pre-fill the Create Expense form.
 * It is a partial CreateExpensesDto – plus optional vendor_name for lookup.
 */
export type AiExpensePrefill = Partial<CreateExpensesDto> & {
	/** Human-readable vendor name so CreateExpense can auto-select it when the list loads */
	vendor_name?: string;
};

