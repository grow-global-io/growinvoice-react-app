/**
 * Utility function to translate quotation template HTML content
 * Replaces English labels with translated versions based on current locale
 */

export const translateQuotationHtml = (html: string, t: (key: string) => string): string => {
	if (!html) return html;

	let translatedHtml = html;

	// First pass: Replace all translation keys that appear as literal strings
	// This handles keys that the backend inserts directly into HTML
	// Order matters: longer keys first to avoid partial matches
	const translationKeyMap: Array<{ key: string; value: string }> = [
		{
			key: "quotation.template.quotation.template.cash",
			value: t("quotation.template.cash"),
		},
		{
			key: "quotation.template.recipientCashDetails",
			value: t("quotation.template.recipientCashDetails"),
		},
		{
			key: "quotation.template.recipientEuropeanBankDetails",
			value: t("quotation.template.recipientEuropeanBankDetails"),
		},
		{
			key: "quotation.template.totalTaxesAmount",
			value: t("quotation.template.totalTaxesAmount"),
		},
		{
			key: "quotation.template.totalTaxesPercent",
			value: t("quotation.template.totalTaxesPercent"),
		},
		{
			key: "quotation.template.thankYouMessage",
			value: t("quotation.template.thankYouMessage"),
		},
		{
			key: "quotation.template.unitPrice",
			value: t("quotation.template.unitPrice"),
		},
		{
			key: "quotation.template.cash",
			value: t("quotation.template.cash"),
		},
		{
			key: "quotation.template.unit",
			value: t("quotation.template.unit"),
		},
		{
			key: "quotation.template.paymentTerms",
			value: t("quotation.template.paymentTerms"),
		},
		{
			key: "quotation.template.termsConditions",
			value: t("quotation.template.termsConditions"),
		},
		{
			key: "quotation.template.termsClaim",
			value: t("quotation.template.termsClaim"),
		},
		{
			key: "quotation.template.termsDelivery",
			value: t("quotation.template.termsDelivery"),
		},
	];

	// Replace all translation keys with their translations
	// Process in order (longest first) to avoid partial matches
	translationKeyMap.forEach(({ key, value }) => {
		// Simple string replacement - replace all occurrences
		// This is more reliable than regex for exact key matching
		// Use split/join for global replacement instead of while loop
		translatedHtml = translatedHtml.split(key).join(value);
	});

	// Create a mapping of English text to translation keys
	// Order matters - match longer strings first to avoid partial replacements
	const translations: Array<{
		english: RegExp;
		translation: string | ((match: string, ...args: string[]) => string);
	}> = [
		// Quotation header - match QUOTATION in various contexts
		{ english: />QUOTATION</gi, translation: `>${t("quotation.template.quotation")}<` },
		{ english: /QUOTATION</gi, translation: `${t("quotation.template.quotation")}<` },
		{ english: /\bQUOTATION\b/gi, translation: t("quotation.template.quotation") },
		{ english: /QUOTATION/gi, translation: t("quotation.template.quotation") },

		// Quotation number and date - be more flexible with spacing
		{ english: /Quotation\s+No:/gi, translation: t("quotation.template.quotationNo") },
		{ english: /Quotation\s+No\.:/gi, translation: t("quotation.template.quotationNo") },
		{ english: />Date:/gi, translation: `>${t("quotation.template.date")}<` },
		{ english: /Date:/gi, translation: t("quotation.template.date") },

		// Address sections - match with or without leading/trailing whitespace
		{ english: /Quotation\s+To:/gi, translation: t("quotation.template.quotationTo") },
		{ english: /Pay\s+To:/gi, translation: t("quotation.template.payTo") },
		// Recipient's Details - handle various formats
		{
			english: />Recipient['\u2019]s\s+Details:</gi,
			translation: `>${t("quotation.template.recipientsDetails")}<`,
		},
		{
			english: /Recipient['\u2019]s\s+Details:/gi,
			translation: t("quotation.template.recipientsDetails"),
		},
		{
			english: /Recipient['\u2019]s\s+Details/gi,
			translation: t("quotation.template.recipientsDetails"),
		},
		// Payer's Name & Address - handle various formats
		{
			english: />Payer['\u2019]s\s+Name\s*&\s*Address:</gi,
			translation: `>${t("quotation.template.payerNameAddress")}<`,
		},
		{
			english: /Payer['\u2019]s\s+Name\s*&\s*Address:/gi,
			translation: t("quotation.template.payerNameAddress"),
		},
		{
			english: /Payer['\u2019]s\s+Name\s*&\s*Address/gi,
			translation: t("quotation.template.payerNameAddress"),
		},
		{ english: />Name\s*&\s*Address:</gi, translation: `>${t("quotation.template.nameAddress")}:` },
		{ english: /Name\s*&\s*Address:/gi, translation: t("quotation.template.nameAddress") },

		// Table headers - handle various HTML contexts
		{ english: /S\.\s*No/gi, translation: t("quotation.template.serialNo") },
		{ english: />S\.\s*No</gi, translation: `>${t("quotation.template.serialNo")}<` },
		{
			english: /<th[^>]*>\s*Item\s*<\/th>/gi,
			translation: `<th>${t("quotation.template.item")}</th>`,
		},
		{ english: />Item</gi, translation: `>${t("quotation.template.item")}<` },
		{
			english: /<th[^>]*>\s*Qty\s*<\/th>/gi,
			translation: `<th>${t("quotation.template.qty")}</th>`,
		},
		{ english: />Qty</gi, translation: `>${t("quotation.template.qty")}<` },
		{
			english: /<th[^>]*>\s*HSN\s*<\/th>/gi,
			translation: `<th>${t("quotation.template.hsn")}</th>`,
		},
		{ english: />HSN</gi, translation: `>${t("quotation.template.hsn")}<` },
		{ english: /Tax\s*\(%\s*\)/gi, translation: t("quotation.template.tax") },
		{ english: /Tax\(%\s*\)/gi, translation: t("quotation.template.tax") },
		{
			english: /<th[^>]*>\s*Price\s*<\/th>/gi,
			translation: `<th>${t("quotation.template.price")}</th>`,
		},
		{ english: />Price</gi, translation: `>${t("quotation.template.price")}<` },
		{
			english: /<th[^>]*>\s*Total\s*<\/th>/gi,
			translation: `<th>${t("quotation.template.total")}</th>`,
		},
		{ english: />Total</gi, translation: `>${t("quotation.template.total")}<` },

		// Summary section - handle various contexts (order matters: longer patterns first)
		// Match "Discount (X%)" format
		{ english: />Discount\s*\(/gi, translation: `>${t("quotation.template.discount")}<` },
		{ english: /Discount\s*\(/gi, translation: t("quotation.template.discount") },
		// Also match standalone "Discount" in case it appears separately
		{
			english: />Discount</gi,
			translation: `>${t("quotation.template.discount").replace(" (", "")}<`,
		},
		{ english: /\bDiscount\b/gi, translation: t("quotation.template.discount").replace(" (", "") },

		// Subtotal variations - handle with/without HTML tags and colons
		{ english: />Subtoal:</gi, translation: `>${t("quotation.template.subtotal")}:<` },
		{ english: />Subtoal</gi, translation: `>${t("quotation.template.subtotal")}<` },
		{ english: /Subtoal:/gi, translation: `${t("quotation.template.subtotal").replace(":", "")}:` },
		{ english: /Subtoal/gi, translation: t("quotation.template.subtotal") },
		{ english: />Subtotal:</gi, translation: `>${t("quotation.template.subtotal")}:<` },
		{ english: />Subtotal</gi, translation: `>${t("quotation.template.subtotal")}<` },
		{
			english: /Subtotal:/gi,
			translation: `${t("quotation.template.subtotal").replace(":", "")}:`,
		},
		{ english: /Subtotal/gi, translation: t("quotation.template.subtotal") },

		// Grand Total variations
		{ english: />Grand\s+Total:</gi, translation: `>${t("quotation.template.grandTotal")}:<` },
		{ english: />Grand\s+Total</gi, translation: `>${t("quotation.template.grandTotal")}<` },
		{
			english: /Grand\s+Total:/gi,
			translation: `${t("quotation.template.grandTotal").replace(":", "")}:`,
		},
		{ english: /Grand\s+Total/gi, translation: t("quotation.template.grandTotal") },

		// Company details
		{ english: />Company:/gi, translation: `>${t("quotation.template.company")}:` },
		{ english: /Company:/gi, translation: t("quotation.template.company") },
		{ english: />Address:/gi, translation: `>${t("quotation.template.address")}:` },
		{ english: /VAT\s+Number:/gi, translation: t("quotation.template.vatNumber") },
		{ english: />Email:/gi, translation: `>${t("quotation.template.email")}:` },
		{ english: />Tel:/gi, translation: `>${t("quotation.template.tel")}:` },

		// Other fields - handle variations
		// Ref. No. - match with/without colon and in various HTML contexts
		{ english: />Ref\.\s*No\.:</gi, translation: `>${t("quotation.template.refNo")}<` },
		{
			english: />Ref\.\s*No\.</gi,
			translation: `>${t("quotation.template.refNo").replace(":", "")}<`,
		},
		{ english: /Ref\.\s*No\.:/gi, translation: t("quotation.template.refNo") },
		{ english: /Ref\.\s*No\./gi, translation: t("quotation.template.refNo").replace(":", "") },
		{ english: /Ref\s+No:/gi, translation: t("quotation.template.refNo") },
		{ english: />Due\s+Date:</gi, translation: `>${t("quotation.template.dueDate")}<` },
		{ english: /Due\s+Date:/gi, translation: t("quotation.template.dueDate") },
		{ english: /Due\s+Date/gi, translation: t("quotation.template.dueDate") },
		// Note - match with colon in various contexts
		{ english: />Note:</gi, translation: `>${t("quotation.template.note")}<` },
		{ english: /Note:/gi, translation: t("quotation.template.note") },
		{ english: /\bNote\s*:/gi, translation: t("quotation.template.note") },
		// Recipient's UPI Details - match in various HTML contexts
		{
			english: />Recipient['\u2019]s\s+UPI\s+Details</gi,
			translation: `>${t("quotation.template.recipientUpiDetails")}<`,
		},
		{
			english: /Recipient['\u2019]s\s+UPI\s+Details/gi,
			translation: t("quotation.template.recipientUpiDetails"),
		},
		// Recipient's Cash Details - match in various HTML contexts
		{
			english: />Recipient['\u2019]s\s+Cash\s+Details</gi,
			translation: `>${t("quotation.template.recipientCashDetails")}<`,
		},
		{
			english: /Recipient['\u2019]s\s+Cash\s+Details/gi,
			translation: t("quotation.template.recipientCashDetails"),
		},
		// Recipient's European Bank Details - match in various HTML contexts
		{
			english: />Recipient['\u2019]s\s+European\s+Bank\s+Details</gi,
			translation: `>${t("quotation.template.recipientEuropeanBankDetails")}<`,
		},
		{
			english: /Recipient['\u2019]s\s+European\s+Bank\s+Details/gi,
			translation: t("quotation.template.recipientEuropeanBankDetails"),
		},
		// Cash - match standalone
		{ english: />Cash</gi, translation: `>${t("quotation.template.cash")}<` },
		{ english: /\bCash\b/gi, translation: t("quotation.template.cash") },
		// Unit and Unit Price
		{ english: />Unit\s+Price</gi, translation: `>${t("quotation.template.unitPrice")}<` },
		{ english: /Unit\s+Price/gi, translation: t("quotation.template.unitPrice") },
		{ english: />Unit</gi, translation: `>${t("quotation.template.unit")}<` },
		{ english: /\bUnit\b/gi, translation: t("quotation.template.unit") },
		// Total Taxes
		{
			english: />Total\s+Taxes\s*\(%\s*\)</gi,
			translation: `>${t("quotation.template.totalTaxesPercent")}<`,
		},
		{
			english: /Total\s+Taxes\s*\(%\s*\)/gi,
			translation: t("quotation.template.totalTaxesPercent"),
		},
		{
			english: />Total\s+Taxes\s*\(Amount\)</gi,
			translation: `>${t("quotation.template.totalTaxesAmount")}<`,
		},
		{
			english: /Total\s+Taxes\s*\(Amount\)/gi,
			translation: t("quotation.template.totalTaxesAmount"),
		},
		// Thank you message
		{
			english: /Thank\s+you\s+for\s+shopping\s+with\s+us\.\s+Have\s+a\s+Great\s+Day\./gi,
			translation: t("quotation.template.thankYouMessage"),
		},
		// IBAN and BIC - ensure they have colons
		// Match IBAN when followed by closing tag (like >IBAN</span> -> >IBAN:</span>)
		{ english: />IBAN\s*<\//gi, translation: `>IBAN:</` },
		// Match IBAN when followed by space and content (like >IBAN 123 -> >IBAN: 123)
		{ english: />IBAN\s+([0-9A-Z])/gi, translation: (_match, after) => `>IBAN: ${after}` },
		// Match BIC when followed by closing tag (like >BIC</span> -> >BIC:</span>)
		{ english: />BIC\s*<\//gi, translation: `>BIC:</` },
		// Match BIC when followed by space and content (like >BIC 123 -> >BIC: 123)
		{ english: />BIC\s+([0-9A-Z])/gi, translation: (_match, after) => `>BIC: ${after}` },
		// Payment Terms - match with flexible whitespace handling
		{
			english:
				/The\s+payment\s+will\s+be\s+cleared\s+for\s+the\s+recipient\s+in\s+accordance\s+with\s+the\s+General\s+items\s+for\s+payment\s+transmission\s+and\s+only\s+on\s+the\s+basis\s+of\s+the\s+account\s+number\s+given\s+by\s+the\s+payer\./gi,
			translation: t("quotation.template.paymentTerms"),
		},
		// Terms & Conditions heading
		{ english: /Terms\s*&\s*Conditions:/gi, translation: t("quotation.template.termsConditions") },
		// Terms and Conditions content - match text with flexible whitespace handling
		// Allow single spaces, multiple spaces, line breaks, and HTML tags between words
		// Use pattern that allows optional HTML tags and whitespace between words
		{
			english:
				/All(?:\s|<[^>]*>)*claims(?:\s|<[^>]*>)*relating(?:\s|<[^>]*>)*to(?:\s|<[^>]*>)*quantity(?:\s|<[^>]*>)*or(?:\s|<[^>]*>)*shipping(?:\s|<[^>]*>)*errors(?:\s|<[^>]*>)*shall(?:\s|<[^>]*>)*be(?:\s|<[^>]*>)*waived(?:\s|<[^>]*>)*by(?:\s|<[^>]*>)*Buyer(?:\s|<[^>]*>)*unless(?:\s|<[^>]*>)*made(?:\s|<[^>]*>)*in(?:\s|<[^>]*>)*writing(?:\s|<[^>]*>)*to(?:\s|<[^>]*>)*Seller(?:\s|<[^>]*>)*within(?:\s|<[^>]*>)*thirty(?:\s|<[^>]*>)*\(\s*30\s*\)(?:\s|<[^>]*>)*days(?:\s|<[^>]*>)*after(?:\s|<[^>]*>)*delivery(?:\s|<[^>]*>)*of(?:\s|<[^>]*>)*goods(?:\s|<[^>]*>)*to(?:\s|<[^>]*>)*the(?:\s|<[^>]*>)*address(?:\s|<[^>]*>)*stated\./gims,
			translation: t("quotation.template.termsClaim"),
		},
		{
			english:
				/Delivery(?:\s|<[^>]*>)*dates(?:\s|<[^>]*>)*are(?:\s|<[^>]*>)*not(?:\s|<[^>]*>)*guaranteed(?:\s|<[^>]*>)*and(?:\s|<[^>]*>)*Seller(?:\s|<[^>]*>)*has(?:\s|<[^>]*>)*no(?:\s|<[^>]*>)*liability(?:\s|<[^>]*>)*for(?:\s|<[^>]*>)*damages(?:\s|<[^>]*>)*that(?:\s|<[^>]*>)*may(?:\s|<[^>]*>)*be(?:\s|<[^>]*>)*incurred(?:\s|<[^>]*>)*due(?:\s|<[^>]*>)*to(?:\s|<[^>]*>)*any(?:\s|<[^>]*>)*delay(?:\s|<[^>]*>)*in(?:\s|<[^>]*>)*shipment(?:\s|<[^>]*>)*of(?:\s|<[^>]*>)*goods(?:\s|<[^>]*>)*hereunder\.(?:\s|<[^>]*>)*Taxes(?:\s|<[^>]*>)*are(?:\s|<[^>]*>)*excluded(?:\s|<[^>]*>)*unless(?:\s|<[^>]*>)*otherwise(?:\s|<[^>]*>)*stated\./gims,
			translation: t("quotation.template.termsDelivery"),
		},
	];

	// Apply all translations
	translations.forEach(({ english, translation }) => {
		if (typeof translation === "function") {
			translatedHtml = translatedHtml.replace(english, translation);
		} else {
			translatedHtml = translatedHtml.replace(english, translation);
		}
	});

	return translatedHtml;
};
