/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Growinvoice API
 * Enhance your business with Growinvoice API
 * OpenAPI spec version: 1.0
 */

export type PaymentDetailsPaymentType =
	(typeof PaymentDetailsPaymentType)[keyof typeof PaymentDetailsPaymentType];

// eslint-disable-next-line 
export const PaymentDetailsPaymentType = {
	UPI: "UPI",
	EuropeanBank: "EuropeanBank",
	IndianBank: "IndianBank",
	SwiftCode: "SwiftCode",
	Paypal: "Paypal",
	Stripe: "Stripe",
	Razorpay: "Razorpay",
	Mollie: "Mollie",
	Cash: "Cash",
	Cheque: "Cheque",
} as const;
