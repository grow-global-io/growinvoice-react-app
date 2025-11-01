/**
 * Utility function to translate invoice template HTML content
 * Replaces English labels with translated versions based on current locale
 */

export const translateInvoiceHtml = (html: string, t: (key: string) => string): string => {
	if (!html) return html;

	let translatedHtml = html;

	// Create a mapping of English text to translation keys
	// Order matters - match longer strings first to avoid partial replacements
	const translations: Array<{ english: RegExp; translation: string }> = [
		// Invoice header - match INVOICE in various contexts
		{ english: />INVOICE</gi, translation: `>${t("invoice.template.invoice")}<` },
		{ english: /INVOICE</gi, translation: `${t("invoice.template.invoice")}<` },

		// Invoice number and date - be more flexible with spacing
		{ english: /Invoice\s+No:/gi, translation: t("invoice.template.invoiceNo") },
		{ english: /Invoice\s+No\.:/gi, translation: t("invoice.template.invoiceNo") },
		{ english: />Date:/gi, translation: `>${t("invoice.template.date")}<` },
		{ english: /Date:/gi, translation: t("invoice.template.date") },

		// Address sections - match with or without leading/trailing whitespace
		{ english: /Invoice\s+To:/gi, translation: t("invoice.template.invoiceTo") },
		{ english: /Pay\s+To:/gi, translation: t("invoice.template.payTo") },
		// Recipient's Details - handle various formats
		{
			english: />Recipient['\u2019]s\s+Details:</gi,
			translation: `>${t("invoice.template.recipientsDetails")}<`,
		},
		{
			english: /Recipient['\u2019]s\s+Details:/gi,
			translation: t("invoice.template.recipientsDetails"),
		},
		{
			english: /Recipient['\u2019]s\s+Details/gi,
			translation: t("invoice.template.recipientsDetails"),
		},
		// Payer's Name & Address - handle various formats
		{
			english: />Payer['\u2019]s\s+Name\s*&\s*Address:</gi,
			translation: `>${t("invoice.template.payerNameAddress")}<`,
		},
		{
			english: /Payer['\u2019]s\s+Name\s*&\s*Address:/gi,
			translation: t("invoice.template.payerNameAddress"),
		},
		{
			english: /Payer['\u2019]s\s+Name\s*&\s*Address/gi,
			translation: t("invoice.template.payerNameAddress"),
		},
		{ english: />Name\s*&\s*Address:</gi, translation: `>${t("invoice.template.nameAddress")}<` },
		{ english: /Name\s*&\s*Address:/gi, translation: t("invoice.template.nameAddress") },

		// Table headers - handle various HTML contexts
		{ english: /S\.\s*No/gi, translation: t("invoice.template.serialNo") },
		{ english: />S\.\s*No</gi, translation: `>${t("invoice.template.serialNo")}<` },
		{
			english: /<th[^>]*>\s*Item\s*<\/th>/gi,
			translation: `<th>${t("invoice.template.item")}</th>`,
		},
		{ english: />Item</gi, translation: `>${t("invoice.template.item")}<` },
		{ english: /<th[^>]*>\s*Qty\s*<\/th>/gi, translation: `<th>${t("invoice.template.qty")}</th>` },
		{ english: />Qty</gi, translation: `>${t("invoice.template.qty")}<` },
		{ english: /<th[^>]*>\s*HSN\s*<\/th>/gi, translation: `<th>${t("invoice.template.hsn")}</th>` },
		{ english: />HSN</gi, translation: `>${t("invoice.template.hsn")}<` },
		{ english: /Tax\s*\(%\s*\)/gi, translation: t("invoice.template.tax") },
		{ english: /Tax\(%\s*\)/gi, translation: t("invoice.template.tax") },
		{
			english: /<th[^>]*>\s*Price\s*<\/th>/gi,
			translation: `<th>${t("invoice.template.price")}</th>`,
		},
		{ english: />Price</gi, translation: `>${t("invoice.template.price")}<` },
		{
			english: /<th[^>]*>\s*Total\s*<\/th>/gi,
			translation: `<th>${t("invoice.template.total")}</th>`,
		},
		{ english: />Total</gi, translation: `>${t("invoice.template.total")}<` },

		// Summary section - handle various contexts (order matters: longer patterns first)
		// Match "Discount (X%)" format - we'll translate "Discount (" and keep the percentage
		// Need to match "Discount" before the opening parenthesis in various contexts
		{ english: />Discount\s*\(/gi, translation: `>${t("invoice.template.discount")}<` },
		{ english: /Discount\s*\(/gi, translation: t("invoice.template.discount") },
		// Also match standalone "Discount" in case it appears separately
		{
			english: />Discount</gi,
			translation: `>${t("invoice.template.discount").replace(" (", "")}<`,
		},
		{ english: /\bDiscount\b/gi, translation: t("invoice.template.discount").replace(" (", "") },

		// Subtotal variations - handle with/without HTML tags and colons
		// Match in various HTML tag contexts
		{ english: />Subtotal:</gi, translation: `>${t("invoice.template.subtotal")}:<` },
		{ english: />Subtotal</gi, translation: `>${t("invoice.template.subtotal")}<` },
		{ english: /Subtotal:/gi, translation: `${t("invoice.template.subtotal").replace(":", "")}:` },
		{ english: /Subtotal/gi, translation: t("invoice.template.subtotal") },

		// Due Amount variations
		{ english: />Due\s+Amount:</gi, translation: `>${t("invoice.template.dueAmount")}:<` },
		{ english: />Due\s+Amount</gi, translation: `>${t("invoice.template.dueAmount")}<` },
		{
			english: /Due\s+Amount:/gi,
			translation: `${t("invoice.template.dueAmount").replace(":", "")}:`,
		},
		{ english: /Due\s+Amount/gi, translation: t("invoice.template.dueAmount") },

		// Paid Amount variations
		{ english: />Paid\s+Amount:</gi, translation: `>${t("invoice.template.paidAmount")}:<` },
		{ english: />Paid\s+Amount</gi, translation: `>${t("invoice.template.paidAmount")}<` },
		{
			english: /Paid\s+Amount:/gi,
			translation: `${t("invoice.template.paidAmount").replace(":", "")}:`,
		},
		{ english: /Paid\s+Amount/gi, translation: t("invoice.template.paidAmount") },

		// Grand Total variations
		{ english: />Grand\s+Total:</gi, translation: `>${t("invoice.template.grandTotal")}:<` },
		{ english: />Grand\s+Total</gi, translation: `>${t("invoice.template.grandTotal")}<` },
		{
			english: /Grand\s+Total:/gi,
			translation: `${t("invoice.template.grandTotal").replace(":", "")}:`,
		},
		{ english: /Grand\s+Total/gi, translation: t("invoice.template.grandTotal") },

		// Company details
		{ english: />Company:/gi, translation: `>${t("invoice.template.company")}<` },
		{ english: /Company:/gi, translation: t("invoice.template.company") },
		{ english: />Address:/gi, translation: `>${t("invoice.template.address")}<` },
		{ english: /VAT\s+Number:/gi, translation: t("invoice.template.vatNumber") },
		{ english: />Email:/gi, translation: `>${t("invoice.template.email")}<` },
		{ english: />Tel:/gi, translation: `>${t("invoice.template.tel")}<` },

		// Other fields - handle variations
		// Ref. No. - match with/without colon and in various HTML contexts
		{ english: />Ref\.\s*No\.:</gi, translation: `>${t("invoice.template.refNo")}<` },
		{
			english: />Ref\.\s*No\.</gi,
			translation: `>${t("invoice.template.refNo").replace(":", "")}<`,
		},
		{ english: /Ref\.\s*No\.:/gi, translation: t("invoice.template.refNo") },
		{ english: /Ref\.\s*No\./gi, translation: t("invoice.template.refNo").replace(":", "") },
		{ english: /Ref\s+No:/gi, translation: t("invoice.template.refNo") },
		{ english: />Due\s+Date:</gi, translation: `>${t("invoice.template.dueDate")}<` },
		{ english: /Due\s+Date:/gi, translation: t("invoice.template.dueDate") },
		{ english: /Due\s+Date/gi, translation: t("invoice.template.dueDate") },
		// Note - match with colon in various contexts
		{ english: />Note:</gi, translation: `>${t("invoice.template.note")}<` },
		{ english: /Note:/gi, translation: t("invoice.template.note") },
		{ english: /\bNote\s*:/gi, translation: t("invoice.template.note") },
		// Recipient's UPI Details - match in various HTML contexts
		{
			english: />Recipient['\u2019]s\s+UPI\s+Details</gi,
			translation: `>${t("invoice.template.recipientUpiDetails")}<`,
		},
		{
			english: /Recipient['\u2019]s\s+UPI\s+Details/gi,
			translation: t("invoice.template.recipientUpiDetails"),
		},
		{ english: /Terms\s*&\s*Conditions:/gi, translation: t("invoice.template.termsConditions") },

		// Terms and Conditions content - match text with flexible whitespace handling
		// Allow single spaces, multiple spaces, line breaks, and HTML tags between words
		{
			english:
				/All\s+claims\s+relating\s+to\s+quantity\s+or\s+shipping\s+errors\s+shall\s+be\s+waived\s+by\s+Buyer\s+unless\s+made\s+in\s+writing\s+to\s+Seller\s+within\s+thirty\s*\(\s*30\s*\)\s*days\s+after\s+delivery\s+of\s+goods\s+to\s+the\s+address\s+stated\./gi,
			translation: t("invoice.template.termsClaim"),
		},
		{
			english:
				/Delivery\s+dates\s+are\s+not\s+guaranteed\s+and\s+Seller\s+has\s+no\s+liability\s+for\s+damages\s+that\s+may\s+be\s+incurred\s+due\s+to\s+any\s+delay\s+in\s+shipment\s+of\s+goods\s+hereunder\.\s+Taxes\s+are\s+excluded\s+unless\s+otherwise\s+stated\./gi,
			translation: t("invoice.template.termsDelivery"),
		},
	];

	// Apply all translations
	translations.forEach(({ english, translation }) => {
		translatedHtml = translatedHtml.replace(english, translation);
	});

	return translatedHtml;
};
