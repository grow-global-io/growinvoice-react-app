/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Growinvoice API
 * Enhance your business with Growinvoice API
 * OpenAPI spec version: 1.0
 */
import type { UserCurrency } from "./userCurrency";

export interface User {
	createdAt: string;
	/** @nullable */
	currency?: UserCurrency;
	/** @nullable */
	currency_id: string | null;
	email: string;
	id: string;
	isExist: boolean;
	/** @nullable */
	name: string | null;
	password: string;
	/** @nullable */
	phone: string | null;
	/** @nullable */
	resetToken: string | null;
	/** @nullable */
	resetTokenExpiry: string | null;
	/** @nullable */
	updatedAt: string | null;
}
