// Simple currency conversion utilities used client-side where API totals
// don't account for multi-currency. Extend this mapping as needed.

export type CurrencyCode = string | undefined | null;

// Business rule: EUR <-> INR conversion at 1 EUR = 100 INR
// Convert any currency to the target currency
export function convertToTargetCurrency(
	amount: number,
	fromCurrency: CurrencyCode,
	targetCurrency: CurrencyCode,
): number {
	if (!amount || isNaN(amount as number)) return 0;

	const fromCode = (fromCurrency ?? "INR").toUpperCase();
	const targetCode = (targetCurrency ?? "INR").toUpperCase();

	// If same currency, no conversion needed
	if (fromCode === targetCode) return amount;

	// EUR to INR: multiply by 100
	if (fromCode === "EUR" && targetCode === "INR") return amount * 100;

	// INR to EUR: divide by 100
	if (fromCode === "INR" && targetCode === "EUR") return amount / 100;

	// For any other currency combinations, assume 1:1 for now
	return amount;
}

// Legacy function for backward compatibility
export function convertToINR(amount: number, fromCurrency: CurrencyCode): number {
	return convertToTargetCurrency(amount, fromCurrency, "INR");
}
