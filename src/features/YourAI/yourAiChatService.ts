/**
 * Your AI chat. Prefer backend POST /api/openai/chat (OPENAI_API_KEY on server).
 * If backend is not available, uses VITE_OPENAI_API_KEY from env (client-side; keep key server-side in production).
 */
import { authInstance } from "../../api/instances/authInstance";

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessagePayload {
	role: ChatMessageRole;
	content: string;
}

export interface YourAiChatRequest {
	messages: ChatMessagePayload[];
	/** Base64 strings (no data URL prefix) for images the AI can see */
	imageBase64?: string[];
}

export interface YourAiChatResponse {
	content: string;
}

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

/** Build OpenAI API messages: last user message can include image parts when imageBase64 is provided */
function buildOpenAiMessages(
	messages: ChatMessagePayload[],
	imageBase64?: string[],
): Array<{ role: string; content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> }> {
	if (!messages.length) return [];
	const out = messages.map((m) => ({ role: m.role, content: m.content }));
	if (imageBase64?.length && out.length > 0) {
		const last = out[out.length - 1];
		if (last.role === "user" && typeof last.content === "string") {
			const parts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
				{ type: "text", text: last.content || "What do you see in these images?" },
			];
			for (const b64 of imageBase64) {
				const mime = b64.startsWith("/9j/") ? "image/jpeg" : "image/png";
				parts.push({ type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } });
			}
			(last as unknown as { content: typeof parts }).content = parts;
		}
	}
	return out as Array<{ role: string; content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> }>;
}

/** Call OpenAI from the client (uses VITE_OPENAI_API_KEY). For production, use backend. */
async function sendOpenAiDirect(payload: YourAiChatRequest): Promise<YourAiChatResponse> {
	const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
	if (!apiKey) throw new Error("VITE_OPENAI_API_KEY is not set. Add it to .env or use a backend /api/openai/chat.");
	const messages = buildOpenAiMessages(payload.messages, payload.imageBase64);
	const res = await fetch(OPENAI_CHAT_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			messages,
			max_tokens: 1024,
		}),
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(err || `OpenAI API error: ${res.status}`);
	}
	const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
	const content = data?.choices?.[0]?.message?.content ?? "";
	return { content };
}

/** True when running on localhost so we can use direct OpenAI; production must use backend (CORS blocks direct). */
function isLocalOrigin(): boolean {
	if (typeof window === "undefined") return false;
	try {
		const origin = window.location?.origin ?? "";
		return /^https?:\/\/localhost(:\d+)?$/i.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin);
	} catch {
		return false;
	}
}

export async function sendYourAiChat(payload: YourAiChatRequest): Promise<YourAiChatResponse> {
	try {
		const res = await authInstance<YourAiChatResponse>({
			url: "/api/openai/chat",
			method: "POST",
			headers: { "Content-Type": "application/json" },
			data: payload,
		});
		return res as YourAiChatResponse;
	} catch (e) {
		// Backend may not implement /api/openai/chat (404/501). Only fall back to client OpenAI on
		// localhost; in production (e.g. go.growinvoice.com) direct calls hit CORS and fail.
		const err = e as { response?: { status?: number }; status?: number; message?: string };
		const status = err?.response?.status ?? err?.status;
		const isNotFound =
			status === 404 || status === 501 || (err?.message?.includes?.("404") ?? false);
		if (isNotFound && isLocalOrigin()) {
			try {
				return await sendOpenAiDirect(payload);
			} catch (directErr) {
				const msg =
					directErr instanceof Error
						? directErr.message
						: "OpenAI request failed. Set VITE_OPENAI_API_KEY in .env to use the chat.";
				throw new Error(msg);
			}
		}
		if (isNotFound) {
			throw new Error(
				"AI chat is not available. The server must provide /api/openai/chat. Please contact support or try again later.",
			);
		}
		throw e;
	}
}

// --- Extract invoice data from image for creating customer + invoice ---

export interface ExtractedCustomer {
	name: string;
	email?: string | null;
	phone?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	country_name?: string | null;
}

export interface ExtractedLineItem {
	description: string;
	quantity: number;
	unit_price: number;
	total: number;
}

export interface ExtractedInvoiceData {
	customer: ExtractedCustomer;
	invoice_number?: string | null;
	date?: string | null;
	due_date?: string | null;
	line_items: ExtractedLineItem[];
	subtotal?: number | null;
	total?: number | null;
	tax_amount?: number | null;
	currency_code?: string | null;
	notes?: string | null;
}

const EXTRACT_INVOICE_SYSTEM = `You are an invoice data extractor. Given an image of an invoice or receipt, extract structured data as a single JSON object.
Return ONLY valid JSON, no markdown or explanation. Use this exact structure:
{
  "bill_to": {
    "name": "string (required - the customer/recipient the invoice is TO, i.e. Bill To)",
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null",
    "city": "string or null",
    "state": "string or null",
    "zip": "string or null",
    "country_name": "string or null"
  },
  "from": {
    "name": "string or null (the seller/issuer - Bill From; do not use for customer)"
  },
  "invoice_number": "string or null",
  "date": "YYYY-MM-DD or null",
  "due_date": "YYYY-MM-DD or null",
  "line_items": [
    { "description": "string", "quantity": number, "unit_price": number, "total": number }
  ],
  "subtotal": number or null,
  "total": number or null,
  "tax_amount": number or null,
  "currency_code": "string or null (e.g. USD, EUR)",
  "notes": "string or null (any notes or terms from the invoice)"
}
IMPORTANT: bill_to = the party receiving the invoice (customer we will create). from = the seller/issuer (do not use for customer). If the invoice only has one party, put the recipient in bill_to. For line_items, extract every item/row. Ensure totals and amounts are numbers.`;

/** Normalize backend or raw OpenAI response to ExtractedInvoiceData (bill_to/customer + line_items). */
function parseExtractionResponse(obj: Record<string, unknown>): ExtractedInvoiceData {
	const billTo = obj.bill_to as Record<string, unknown> | undefined;
	const legacyCustomer = obj.customer as Record<string, unknown> | undefined;
	const cust = billTo ?? legacyCustomer;
	if (!obj || typeof cust !== "object" || !Array.isArray(obj.line_items)) {
		throw new Error("Extracted data missing bill_to/customer or line_items.");
	}
	const customer: ExtractedCustomer = {
		name: typeof cust.name === "string" ? cust.name : "Imported Customer",
		email: typeof cust.email === "string" ? cust.email : null,
		phone: typeof cust.phone === "string" ? cust.phone : null,
		address: typeof cust.address === "string" ? cust.address : null,
		city: typeof cust.city === "string" ? cust.city : null,
		state: typeof cust.state === "string" ? cust.state : null,
		zip: typeof cust.zip === "string" ? cust.zip : null,
		country_name: typeof cust.country_name === "string" ? cust.country_name : null,
	};
	const line_items = (obj.line_items as Array<Record<string, unknown>>).map((item) => ({
		description: typeof item.description === "string" ? item.description : "Item",
		quantity: typeof item.quantity === "number" ? item.quantity : 1,
		unit_price: typeof item.unit_price === "number" ? item.unit_price : typeof item.total === "number" ? item.total : 0,
		total: typeof item.total === "number" ? item.total : typeof item.unit_price === "number" ? item.unit_price * (typeof item.quantity === "number" ? item.quantity : 1) : 0,
	}));
	const subtotal = typeof obj.subtotal === "number" ? obj.subtotal : null;
	const total = typeof obj.total === "number" ? obj.total : (line_items.length ? line_items.reduce((s, i) => s + i.total, 0) : null);
	return {
		customer,
		invoice_number: typeof obj.invoice_number === "string" ? obj.invoice_number : null,
		date: typeof obj.date === "string" ? obj.date : null,
		due_date: typeof obj.due_date === "string" ? obj.due_date : null,
		line_items,
		subtotal,
		total,
		tax_amount: typeof obj.tax_amount === "number" ? obj.tax_amount : null,
		currency_code: typeof obj.currency_code === "string" ? obj.currency_code : null,
		notes: typeof obj.notes === "string" ? obj.notes : null,
	};
}

/** Call backend for extraction when available; otherwise (localhost only) call OpenAI directly. */
export async function extractInvoiceDataFromImage(
	imageBase64: string[],
): Promise<ExtractedInvoiceData> {
	// 1) Try backend first (production and dev)
	try {
		const res = await authInstance<Record<string, unknown>>({
			url: "/api/openai/extract-invoice",
			method: "POST",
			headers: { "Content-Type": "application/json" },
			data: { imageBase64 },
		});
		if (res && typeof res === "object") {
			if (res.customer && Array.isArray(res.line_items)) {
				return parseExtractionResponse(res);
			}
			// Backend might return raw OpenAI shape with choices[0].message.content
			const raw = (res as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message?.content;
			if (typeof raw === "string") {
				const parsed = JSON.parse(raw) as Record<string, unknown>;
				return parseExtractionResponse(parsed);
			}
		}
		throw new Error("Unexpected extraction response from server.");
	} catch (e) {
		const err = e as { response?: { status?: number }; status?: number; message?: string };
		const status = err?.response?.status ?? err?.status;
		const isNotFound = status === 404 || status === 501 || err?.message?.includes?.("404");
		if (!isNotFound) throw e;
		// 2) Backend not implemented: use direct OpenAI only on localhost (CORS blocks in production)
		if (!isLocalOrigin()) {
			throw new Error(
				"Image extraction is not available. The server must provide POST /api/openai/extract-invoice. See BACKEND_OPENAI_SETUP.md.",
			);
		}
	}

	// 3) Localhost fallback: call OpenAI from client
	const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
	if (!apiKey) throw new Error("VITE_OPENAI_API_KEY is not set.");
	const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
		{ type: "text", text: "Extract all invoice data from this image. Return only the JSON object." },
	];
	for (const b64 of imageBase64) {
		const mime = b64.startsWith("/9j/") ? "image/jpeg" : "image/png";
		content.push({ type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } });
	}
	const res = await fetch(OPENAI_CHAT_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: EXTRACT_INVOICE_SYSTEM },
				{ role: "user", content },
			],
			max_tokens: 2048,
			response_format: { type: "json_object" },
		}),
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(err || `OpenAI API error: ${res.status}`);
	}
	const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
	const raw = data?.choices?.[0]?.message?.content ?? "";
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error("AI did not return valid JSON. Please try again.");
	}
	return parseExtractionResponse(parsed as Record<string, unknown>);
}
