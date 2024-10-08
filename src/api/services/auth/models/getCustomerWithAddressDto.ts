/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Growinvoice API
 * Enhance your business with Growinvoice API
 * OpenAPI spec version: 1.0
 */
import type { CountInvoiceDto } from "./countInvoiceDto";
import type { BillingAddressDto } from "./billingAddressDto";
import type { GetCustomerWithAddressDtoOption } from "./getCustomerWithAddressDtoOption";
import type { ShippingAddressDto } from "./shippingAddressDto";
import type { CountTotalDueDto } from "./countTotalDueDto";

export interface GetCustomerWithAddressDto {
	_count?: CountInvoiceDto;
	billingAddress?: BillingAddressDto;
	billingAddress_id: string;
	createdAt: string;
	currencies_id: string;
	display_name: string;
	email: string;
	id: string;
	isExist: boolean;
	name: string;
	option: GetCustomerWithAddressDtoOption;
	/** @nullable */
	phone: string | null;
	shippingAddress?: ShippingAddressDto;
	shippingAddress_id: string;
	totalDue?: CountTotalDueDto;
	/** @nullable */
	updatedAt: string | null;
	user_id: string;
	/** @nullable */
	website: string | null;
}
