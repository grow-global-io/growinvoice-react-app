import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, Link, Paper, TextField, Typography, useTheme } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
	extractInvoiceDataFromImage,
	sendYourAiChat,
	type ChatMessagePayload,
	type ExtractedInvoiceData,
} from "./yourAiChatService";
import type { AiInvoicePrefill } from "@features/Invoices/types/aiInvoicePrefill";
import { AlertService } from "@shared/services/AlertService";
import { useAuthStore } from "@store/auth";
import {
	getCustomerControllerFindAllQueryKey,
	useCustomerControllerCreate,
	useCustomerControllerFindAll,
} from "@api/services/customer";
import {
	getProductControllerFindAllQueryKey,
	useProductControllerCreate,
	useProductControllerFindAll,
} from "@api/services/product";
import {
	getVendorsControllerFindAllQueryKey,
	useVendorsControllerCreate,
	useVendorsControllerFindAll,
} from "@api/services/vendors";
import {
	getProductunitControllerFindAllQueryKey,
	useProductunitControllerCreate,
	useProductunitControllerFindAll,
} from "@api/services/productunit";
import { usePaymentdetailsControllerFindAll } from "@api/services/paymentdetails";
import { useInvoicesettingsControllerFindFirst } from "@api/services/invoicesettings";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import {
	CreateCustomerWithAddressDtoOption,
	CreateInvoiceWithProductsRecurring,
	CreateProductWithTaxDtoType,
	CreateExpensesDtoCategory,
} from "@api/services/models";
import { http } from "@shared/axios";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useInvoiceControllerCreate } from "@api/services/invoice";
import { useExpensesControllerCreate } from "@api/services/expenses";
import { formatDateToIso } from "@shared/formatter";

interface UiMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	imageBase64?: string[];
	fileName?: string;
	/** When set, show a "View invoice" link below the content */
	invoiceId?: string;
}

// Limit image size to avoid 413 (request entity too large) from backend / OpenAI.
// 2MB is a safe default and matches other upload limits in the app.
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			const base64 = result.includes(",") ? result.split(",")[1] : result;
			resolve(base64 ?? "");
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

/** True when user message suggests creating customer + invoice from the uploaded image */
function isCreateFromInvoiceIntent(text: string): boolean {
	const lower = text.trim().toLowerCase();
	const hasCreate = /create|make|add|extract|generate|import/.test(lower);
	const hasInvoice = /invoice|customer|from this|from (the )?image|this (document|receipt)/.test(
		lower,
	);
	return hasCreate && (hasInvoice || lower.length < 30);
}

/** True when user message suggests creating an expense from the uploaded image */
function isCreateExpenseIntent(text: string): boolean {
	const lower = text.trim().toLowerCase();
	const hasCreate = /create|make|add|record|log|import/.test(lower);
	const hasExpense = /expense|expenses|bill|receipt/.test(lower);
	return hasCreate && hasExpense;
}

// Browser Speech Recognition API (not in all TS libs; use any for constructor/instance)
const SpeechRecognition =
	typeof window !== "undefined"
		? (((window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
				(window as unknown as { webkitSpeechRecognition?: new () => unknown })
					.webkitSpeechRecognition) ??
			null)
		: null;

export default function YourAIChat() {
	const { t } = useTranslation();
	const theme = useTheme();
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [messages, setMessages] = useState<UiMessage[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [images, setImages] = useState<{ base64: string; name: string }[]>([]);
	const [attachedReceiptFile, setAttachedReceiptFile] = useState<File | null>(null);
	const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
	const [listening, setListening] = useState(false);
	/** When set, the assistant message with this id is shown with typing effect (visible length) */
	const [typingState, setTypingState] = useState<{
		messageId: string;
		visibleLength: number;
	} | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const recognitionRef = useRef<{ start(): void; stop(): void } | null>(null);
	/** When set, next user message is treated as answer for missing invoice settings (e.g. "Use first") */
	const [pendingInvoiceFromAi, setPendingInvoiceFromAi] = useState<{
		extracted: ExtractedInvoiceData;
	} | null>(null);

	const queryClient = useQueryClient();
	const createCustomer = useCustomerControllerCreate();
	const createProduct = useProductControllerCreate();
	const customersList = useCustomerControllerFindAll();
	const productsList = useProductControllerFindAll();
	const createVendor = useVendorsControllerCreate();
	const vendorsList = useVendorsControllerFindAll();
	const createProductUnit = useProductunitControllerCreate();
	const productUnits = useProductunitControllerFindAll();
	const paymentDetails = usePaymentdetailsControllerFindAll();
	const invoiceSettings = useInvoicesettingsControllerFindFirst();
	const currencies = useCurrencyControllerFindAll();
	const createExpenses = useExpensesControllerCreate();
	const createInvoice = useInvoiceControllerCreate();

	/** Normalize for matching: trim and lowercase */
	const norm = (s: string) => (s ?? "").trim().toLowerCase();
	/** Find existing customer by name and optionally email; return id or null */
	const findExistingCustomerId = useCallback(
		(name: string, email?: string | null): string | null => {
			const list = customersList.data;
			if (!list?.length) return null;
			const n = norm(name);
			const e = email ? norm(email) : "";

			// 1. Try to find by Email first (if provided)
			if (e) {
				const emailMatch = list.find((c) => {
					const custEmail = (c as { email?: string | null }).email;
					return custEmail && norm(custEmail) === e;
				});
				if (emailMatch) return (emailMatch as { id: string }).id;
			}

			const match = list.find((c) => {
				const sameName =
					norm((c as { display_name?: string; name?: string }).display_name ?? "") === n ||
					norm((c as { display_name?: string; name?: string }).name ?? "") === n;
				if (!sameName) return false;
				if (e) {
					const custEmail = (c as { email?: string | null }).email;
					return custEmail ? norm(custEmail) === e : true;
				}
				return true;
			});
			return match ? (match as { id: string }).id : null;
		},
		[customersList.data],
	);
	/** Find existing product id by name for current user; return id or null */
	const findExistingProductId = useCallback(
		(productName: string): string | null => {
			const list = productsList.data;
			if (!list?.length || !user?.id) return null;
			const n = norm(productName);
			const match = list.find(
				(p) =>
					(p as { user_id?: string }).user_id === user.id &&
					norm((p as { name?: string }).name ?? "") === n,
			);
			return match ? (match as { id: string }).id : null;
		},
		[productsList.data, user?.id],
	);

	/** Find existing vendor by name and optionally email; return id or null */
	const findExistingVendorId = useCallback(
		(name: string, email?: string | null): string | null => {
			const list = vendorsList.data;
			if (!list?.length || !user?.id) return null;
			const n = norm(name);
			const e = email ? norm(email) : "";
			const match = list.find((v) => {
				if ((v as { user_id?: string }).user_id !== user.id) return false;
				const sameName =
					norm((v as { display_name?: string; name?: string }).display_name ?? "") === n ||
					norm((v as { display_name?: string; name?: string }).name ?? "") === n;
				if (!sameName) return false;
				if (e) {
					const venEmail = (v as { email?: string | null }).email;
					return venEmail ? norm(venEmail) === e : true;
				}
				return true;
			});
			return match ? (match as { id: string }).id : null;
		},
		[vendorsList.data, user?.id],
	);

	/** Prefer unit named "pc", else first unit, else create a "pc" unit. */
	const getOrCreatePcUnitId = useCallback(async (): Promise<string> => {
		const pcUnit = productUnits.data?.find((u) => u.name?.toLowerCase() === "pc");
		const existing = pcUnit?.id ?? productUnits.data?.[0]?.id ?? "";
		if (existing) return existing;
		if (!user?.id) return "";
		try {
			const res = await createProductUnit.mutateAsync({
				data: { name: "pc", user_id: user.id },
			});
			const id = (res as { result?: { id?: string } })?.result?.id ?? "";
			if (id) {
				await queryClient.invalidateQueries({
					queryKey: getProductunitControllerFindAllQueryKey(),
				});
			}
			return id;
		} catch {
			return "";
		}
	}, [productUnits.data, user?.id, createProductUnit, queryClient]);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	// Typing effect: reveal assistant message character by character
	useEffect(() => {
		if (!typingState) return;
		const msg = messages.find((m) => m.id === typingState.messageId);
		const fullLen = msg?.content?.length ?? 0;
		if (typingState.visibleLength >= fullLen) {
			setTypingState(null);
			return;
		}
		const step = fullLen > 200 ? 3 : fullLen > 80 ? 2 : 1;
		const delay = fullLen > 300 ? 15 : 25;
		const t = setTimeout(() => {
			setTypingState((prev) =>
				prev ? { ...prev, visibleLength: Math.min(prev.visibleLength + step, fullLen) } : null,
			);
		}, delay);
		return () => clearTimeout(t);
	}, [typingState, messages]);

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files?.length) return;

		const validFiles = Array.from(files).filter((file) => {
			if (!file.type.startsWith("image/")) return false;
			if (file.size > MAX_IMAGE_SIZE_BYTES) {
				AlertService.instance?.errorMessage(
					t("yourAi.imageTooLarge", {
						defaultValue: "Image is too large. Please upload an image smaller than 2 MB.",
					}),
				);
				return false;
			}
			return true;
		});

		if (!validFiles.length) {
			e.target.value = "";
			return;
		}

		// Remember the first valid image file so we can upload it later for expense receipt_url
		setAttachedReceiptFile(validFiles[0]);

		Promise.all(
			validFiles.map(async (file) => {
				const base64 = await fileToBase64(file);
				return { base64, name: file.name };
			}),
		).then((results) => {
			setImages((prev) => [
				...prev,
				...results.filter((r): r is { base64: string; name: string } => r != null),
			]);
		});
		e.target.value = "";
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setAttachedFileName(file.name);
		e.target.value = "";
	};

	const removeImage = (index: number) => {
		setImages((prev) => {
			const next = prev.filter((_, i) => i !== index);
			if (next.length === 0) {
				setAttachedReceiptFile(null);
			}
			return next;
		});
	};

	const clearAttachments = () => {
		setImages([]);
		setAttachedFileName(null);
		setAttachedReceiptFile(null);
	};

	const uploadReceiptFile = useCallback(async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append("file", file);
		const res = await http.post("/api/upload", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		const data = res.data as { link?: string; result?: { link?: string } };
		return data.link ?? data.result?.link ?? "";
	}, []);

	const startListening = () => {
		if (!SpeechRecognition) {
			AlertService.instance?.errorMessage(
				t("yourAi.voiceNotSupported", {
					defaultValue: "Voice input is not supported in this browser.",
				}),
			);
			return;
		}
		const RecognitionCtor = SpeechRecognition as new () => {
			start(): void;
			stop(): void;
			continuous: boolean;
			interimResults: boolean;
			lang: string;
			onresult:
				| ((e: { results: Array<{ 0: { transcript: string }; isFinal: boolean }> }) => void)
				| null;
			onerror: (() => void) | null;
		};
		const recognition = new RecognitionCtor();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = navigator.language || "en-US";
		recognition.onresult = (event: {
			results: Array<{ 0: { transcript: string }; isFinal: boolean }>;
		}) => {
			const transcript = Array.from(event.results)
				.map((r: { 0: { transcript: string }; isFinal: boolean }) => r[0].transcript)
				.join("");
			if (event.results[event.results.length - 1].isFinal) {
				setInput((prev) => (prev ? `${prev} ${transcript}` : transcript).trim());
			}
		};
		recognition.onerror = () => setListening(false);
		recognition.start();
		recognitionRef.current = recognition;
		setListening(true);
	};

	const stopListening = () => {
		recognitionRef.current?.stop();
		recognitionRef.current = null;
		setListening(false);
	};

	const handleSend = async () => {
		const text = input.trim();
		const hasImages = images.length > 0;
		const fileNote = attachedFileName ? ` [Attached file: ${attachedFileName}]` : "";
		const content =
			text ||
			(hasImages
				? t("yourAi.whatInImages", { defaultValue: "What do you see in these images?" })
				: "");
		if (!content && !hasImages) return;

		const userMsg: UiMessage = {
			id: `user-${Date.now()}`,
			role: "user",
			content: content + fileNote,
			imageBase64: hasImages ? images.map((i) => i.base64) : undefined,
			fileName: attachedFileName ?? undefined,
		};
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		clearAttachments();
		setLoading(true);

		// If user asked to create INVOICE from the image: extract and navigate to Create Invoice with prefill
		if (hasImages && isCreateFromInvoiceIntent(content) && user?.id) {
			let extracted: ExtractedInvoiceData;
			try {
				extracted = await extractInvoiceDataFromImage(userMsg.imageBase64!);
			} catch (extractErr) {
				const msg = extractErr instanceof Error ? extractErr.message : "Extraction failed";
				AlertService.instance?.errorMessage(msg);
				setMessages((prev) => [
					...prev,
					{
						id: `assistant-extract-err-${Date.now()}`,
						role: "assistant",
						content: t("yourAi.createFromImageFailed", {
							defaultValue:
								"I couldn't extract data from the image. Please try again with a clearer image.",
						}),
					},
				]);
				setLoading(false);
				return;
			}

			try {
				const unitId = await getOrCreatePcUnitId();
				const paymentId = paymentDetails.data?.[0]?.id ?? "";
				const templateId = invoiceSettings?.data?.invoiceTemplateId ?? "";
				const invoiceCurrencyCode = extracted.currency_code?.toUpperCase?.() ?? "";
				const currencyId =
					invoiceCurrencyCode === "EUR"
						? ((
								currencies.data as
									| Array<{ id: string; short_code?: string; code?: string }>
									| undefined
							)?.find(
								(c) =>
									(c.short_code ?? "").toUpperCase() === "EUR" ||
									(c.code ?? "").toUpperCase() === "EUR",
							)?.id ?? "")
						: invoiceCurrencyCode === "INR"
							? ((
									currencies.data as
										| Array<{ id: string; short_code?: string; code?: string }>
										| undefined
								)?.find(
									(c) =>
										(c.short_code ?? "").toUpperCase() === "INR" ||
										(c.code ?? "").toUpperCase() === "INR",
								)?.id ?? "")
							: "";

				let customerId =
					findExistingCustomerId(extracted.customer.name, extracted.customer.email) ?? null;

				// If not found locally, try refetching the list in case it's stale
				if (!customerId) {
					try {
						const { data: freshData } = await customersList.refetch();
						if (freshData?.length) {
							const n = norm(extracted.customer.name);
							const e = extracted.customer.email ? norm(extracted.customer.email) : "";

							// 1. Try by email
							if (e) {
								const match = (freshData as any[]).find((c) => c.email && norm(c.email) === e);
								if (match) customerId = match.id;
							}
							// 2. Try by name if still not found
							if (!customerId) {
								const match = (freshData as any[]).find((c) => {
									const name1 = norm(c.display_name ?? "");
									const name2 = norm(c.name ?? "");
									return (
										(name1 === n || name2 === n) && (!e || (c.email ? norm(c.email) === e : true))
									);
								});
								if (match) customerId = match.id;
							}
						}
					} catch (refetchErr) {
						console.warn("Failed to refetch customers", refetchErr);
					}
				}

				if (!customerId) {
					const randomEmail = `noemail.user-${Date.now()}@gmail.com`;
					const customerEmail = extracted.customer.email ?? randomEmail;

					try {
						const customerRes = await createCustomer.mutateAsync({
							data: {
								user_id: user.id,
								name: extracted.customer.name,
								display_name: extracted.customer.name,
								option: CreateCustomerWithAddressDtoOption.Individual,
								email: customerEmail,
								phone: extracted.customer.phone ?? null,
								...(currencyId && { currencies_id: currencyId }),
								...(extracted.customer.address &&
									extracted.customer.city &&
									extracted.customer.zip && {
										billingDetails: {
											address: extracted.customer.address,
											city: extracted.customer.city,
											zip: extracted.customer.zip,
											state_name: extracted.customer.state ?? undefined,
											country_name: extracted.customer.country_name ?? undefined,
										},
									}),
							},
						});
						customerId = customerRes?.result?.id ?? null;
					} catch (err: any) {
						// If customer already exists, try to find it again after refreshing list
						if (
							err?.message?.includes("already exists") ||
							err?.response?.data?.message?.includes("already exists")
						) {
							await queryClient.invalidateQueries({
								queryKey: getCustomerControllerFindAllQueryKey(),
							});
							// We need to wait a bit or just re-read from the cache if invalidate triggers refetch?
							// invalidateQueries triggers a refetch in background.
							// To get the updated data immediately is tricky without 'await queryClient.fetchQuery'.
							// But createCustomer failing implies it IS in the backend.

							// Let's try to fetch all again or just use the findExistingCustomerId if the list updated?
							// Since we can't easily force-wait for the hook state to update here without refactoring,
							// we might be better off just falling back to prefill if we can't find it.

							// However, usually "already exists" means we SHOULD find it.
							// Let's fall back to prefill, but with a specific message?
							// actually, let's just let the outer catch handle it, but maybe log it.
							console.warn("Customer exists but was not found locally. Falling back.", err);
							throw err;
						}
						throw err;
					}
				}
				if (!customerId) throw new Error("Customer creation did not return an id.");

				const prefillRows: AiInvoicePrefill["rows"] = [];
				if (unitId && currencyId && extracted.line_items.length > 0) {
					for (let i = 0; i < extracted.line_items.length; i++) {
						const line = extracted.line_items[i];
						const itemName = line.description || `Item ${i + 1}`;
						let pid = findExistingProductId(itemName);
						if (!pid) {
							const productRes = await createProduct.mutateAsync({
								data: {
									user_id: user.id,
									name: itemName,
									type: CreateProductWithTaxDtoType.Goods,
									unit_id: unitId,
									priceBook: [{ currency_id: currencyId, price: line.unit_price }],
								},
							});
							pid = (productRes as any)?.data?.id ?? (productRes as any)?.result?.id ?? "";
						}
						if (pid) {
							prefillRows.push({
								id: `row-${i}-${Date.now()}`,
								product_id: pid,
								product_name: itemName,
								quantity: line.quantity,
								price: line.unit_price,
								total: line.total,
							});
						}
					}
				}

				const invDate =
					extracted.date && moment(extracted.date).isValid()
						? moment(extracted.date).format("YYYY-MM-DD")
						: moment().format("YYYY-MM-DD");
				const dueDate = moment(invDate).add(1, "day").format("YYYY-MM-DD");
				const totalAmount =
					extracted.total ?? extracted.line_items.reduce((s, i) => s + i.total, 0);
				const invNumber = extracted.invoice_number || `INV-${Date.now()}`;

				await createInvoice.mutateAsync({
					data: {
						customer_ids: [customerId],
						paymentId: paymentId ?? "",
						template_id: templateId ?? "",
						currency_id: currencyId ?? "",
						date: formatDateToIso(invDate),
						due_date: formatDateToIso(dueDate),
						invoice_number: invNumber,
						reference_number: invNumber,
						notes: extracted.notes ?? "",
						sub_total: extracted.subtotal ?? totalAmount,
						total: totalAmount,
						paid_amount: 0,
						due_amount: totalAmount,
						user_id: user.id,
						recurring: CreateInvoiceWithProductsRecurring.Daily, // Default, user can change later if needed or we can enhance AI to detect
						is_recurring: false,
						product: prefillRows.map((row) => ({
							product_id: row.product_id,
							quantity: row.quantity,
							price: row.price,
							total: row.total,
							taxes: [],
							discount: 0,
						})),
					},
				});

				setPendingInvoiceFromAi(null);
				await queryClient.invalidateQueries({ queryKey: getCustomerControllerFindAllQueryKey() });
				await queryClient.invalidateQueries({ queryKey: getProductControllerFindAllQueryKey() });
				setMessages((prev) => [
					...prev,
					{
						id: `assistant-redirect-${Date.now()}`,
						role: "assistant",
						content: t("yourAi.invoiceCreated", {
							defaultValue: "I've created the invoice for you. Taking you to the Invoices list.",
						}),
					},
				]);
				navigate("/invoice/invoicelist");
			} catch (err) {
				console.error("Auto-invoice creation failed, falling back to prefill", err);

				// Proceed with partial prefill
				const invDate =
					extracted.date && moment(extracted.date).isValid()
						? moment(extracted.date).format("YYYY-MM-DD")
						: moment().format("YYYY-MM-DD");
				const dueDate = moment(invDate).add(1, "day").format("YYYY-MM-DD");
				const totalAmount =
					extracted.total ?? extracted.line_items.reduce((s, i) => s + i.total, 0);
				const invNumber = extracted.invoice_number || `INV-${Date.now()}`;
				const paymentId = paymentDetails.data?.[0]?.id ?? "";
				const templateId = invoiceSettings?.data?.invoiceTemplateId ?? "";
				const invoiceCurrencyCode = extracted.currency_code?.toUpperCase?.() ?? "";
				const currencyId =
					invoiceCurrencyCode === "EUR"
						? ((
								currencies.data as
									| Array<{ id: string; short_code?: string; code?: string }>
									| undefined
							)?.find(
								(c) =>
									(c.short_code ?? "").toUpperCase() === "EUR" ||
									(c.code ?? "").toUpperCase() === "EUR",
							)?.id ?? "")
						: invoiceCurrencyCode === "INR"
							? ((
									currencies.data as
										| Array<{ id: string; short_code?: string; code?: string }>
										| undefined
								)?.find(
									(c) =>
										(c.short_code ?? "").toUpperCase() === "INR" ||
										(c.code ?? "").toUpperCase() === "INR",
								)?.id ?? "")
							: "";
				const partialPrefill: AiInvoicePrefill = {
					customer_ids: [],
					paymentId: paymentId ?? "",
					template_id: templateId ?? "",
					currency_id: currencyId ?? "",
					date: invDate,
					due_date: dueDate,
					invoice_number: invNumber,
					reference_number: invNumber,
					notes: "",
					sub_total: extracted.subtotal ?? totalAmount,
					total: totalAmount,
					paid_amount: 0,
					due_amount: totalAmount,
					rows: [],
				};
				setPendingInvoiceFromAi(null);
				await queryClient.invalidateQueries({ queryKey: getCustomerControllerFindAllQueryKey() });
				await queryClient.invalidateQueries({ queryKey: getProductControllerFindAllQueryKey() });
				setMessages((prev) => [
					...prev,
					{
						id: `assistant-redirect-${Date.now()}`,
						role: "assistant",
						content: t("yourAi.takingYouToCreateInvoice", {
							defaultValue:
								"I couldn't complete the automatic creation. Taking you to the Create Invoice page with the data I could collect.",
						}),
					},
				]);
				navigate("/invoice/createinvoice", { state: { fromAiPrefill: partialPrefill } });
			}
			setLoading(false);
			return;
		}

		// If user is replying to "missing invoice settings", treat as "Use first" or wait for Settings
		if (pendingInvoiceFromAi && user?.id) {
			const reply = text.trim().toLowerCase();
			const useFirst = /use first|defaults|use default|first option/i.test(reply);
			if (useFirst) {
				const unitId = await getOrCreatePcUnitId();
				const paymentId = paymentDetails.data?.[0]?.id ?? "";
				const templateId = invoiceSettings?.data?.invoiceTemplateId ?? "";
				const { extracted } = pendingInvoiceFromAi;
				const invoiceCurrencyCode = extracted.currency_code?.toUpperCase?.() ?? "";
				const currencyId =
					invoiceCurrencyCode === "EUR"
						? ((
								currencies.data as
									| Array<{ id: string; short_code?: string; code?: string }>
									| undefined
							)?.find(
								(c) =>
									(c.short_code ?? "").toUpperCase() === "EUR" ||
									(c.code ?? "").toUpperCase() === "EUR",
							)?.id ?? "")
						: invoiceCurrencyCode === "INR"
							? ((
									currencies.data as
										| Array<{ id: string; short_code?: string; code?: string }>
										| undefined
								)?.find(
									(c) =>
										(c.short_code ?? "").toUpperCase() === "INR" ||
										(c.code ?? "").toUpperCase() === "INR",
								)?.id ?? "")
							: "";
				try {
					let customerId =
						findExistingCustomerId(extracted.customer.name, extracted.customer.email) ?? null;
					if (!customerId) {
						const customerRes = await createCustomer.mutateAsync({
							data: {
								user_id: user.id,
								name: extracted.customer.name,
								display_name: extracted.customer.name,
								option: CreateCustomerWithAddressDtoOption.Individual,
								email: extracted.customer.email ?? null,
								phone: extracted.customer.phone ?? null,
								...(currencyId && { currencies_id: currencyId }),
								...(extracted.customer.address &&
									extracted.customer.city &&
									extracted.customer.zip && {
										billingDetails: {
											address: extracted.customer.address,
											city: extracted.customer.city,
											zip: extracted.customer.zip,
											state_name: extracted.customer.state ?? undefined,
											country_name: extracted.customer.country_name ?? undefined,
										},
									}),
							},
						});
						customerId = customerRes?.result?.id ?? null;
					}
					if (!customerId) throw new Error("Customer creation did not return an id.");

					const prefillRows: AiInvoicePrefill["rows"] = [];
					if (unitId && currencyId && extracted.line_items.length > 0) {
						for (let i = 0; i < extracted.line_items.length; i++) {
							const line = extracted.line_items[i];
							const itemName = line.description || `Item ${i + 1}`;
							let pid = findExistingProductId(itemName);
							if (!pid) {
								const productRes = await createProduct.mutateAsync({
									data: {
										user_id: user.id,
										name: itemName,
										type: CreateProductWithTaxDtoType.Goods,
										unit_id: unitId,
										priceBook: [{ currency_id: currencyId, price: line.unit_price }],
									},
								});
								pid = (productRes as any)?.data?.id ?? (productRes as any)?.result?.id ?? "";
							}
							if (pid) {
								prefillRows.push({
									id: `row-${i}-${Date.now()}`,
									product_id: pid,
									product_name: itemName,
									quantity: line.quantity,
									price: line.unit_price,
									total: line.total,
								});
							}
						}
					}

					const invDate =
						extracted.date && moment(extracted.date).isValid()
							? moment(extracted.date).format("YYYY-MM-DD")
							: moment().format("YYYY-MM-DD");
					const dueDate = moment(invDate).add(1, "day").format("YYYY-MM-DD");
					const totalAmount =
						extracted.total ?? extracted.line_items.reduce((s, i) => s + i.total, 0);
					const invNumber = extracted.invoice_number || `INV-${Date.now()}`;

					try {
						await createInvoice.mutateAsync({
							data: {
								customer_ids: [customerId],
								paymentId: paymentId ?? "",
								template_id: templateId ?? "",
								currency_id: currencyId ?? "",
								date: formatDateToIso(invDate),
								due_date: formatDateToIso(dueDate),
								invoice_number: invNumber,
								reference_number: invNumber,
								notes: extracted.notes ?? "",
								sub_total: extracted.subtotal ?? totalAmount,
								total: totalAmount,
								paid_amount: 0,
								due_amount: totalAmount,
								user_id: user.id,
								recurring: CreateInvoiceWithProductsRecurring.Daily, // Default, user can change later if needed or we can enhance AI to detect
								is_recurring: false,
								product: prefillRows.map((row) => ({
									product_id: row.product_id,
									quantity: row.quantity,
									price: row.price,
									total: row.total,
									taxes: [],
									discount: 0,
								})),
							},
						});

						setPendingInvoiceFromAi(null);
						await queryClient.invalidateQueries({
							queryKey: getCustomerControllerFindAllQueryKey(),
						});
						await queryClient.invalidateQueries({
							queryKey: getProductControllerFindAllQueryKey(),
						});
						setMessages((prev) => [
							...prev,
							{
								id: `assistant-redirect-${Date.now()}`,
								role: "assistant",
								content: t("yourAi.invoiceCreated", {
									defaultValue:
										"I've created the invoice for you. Taking you to the Invoices list.",
								}),
							},
						]);
						navigate("/invoice/invoicelist");
					} catch (err) {
						const msg = err instanceof Error ? err.message : "Invoice creation failed";

						// If the error is about existing customer, don't show the scary alert, just fallback gracefully
						const isDuplicateCustomer = msg.toLowerCase().includes("already exists");
						if (!isDuplicateCustomer) {
							AlertService.instance?.errorMessage(msg);
						}

						setMessages((prev) => [
							...prev,
							{
								id: `assistant-create-err-inv-${Date.now()}`,
								role: "assistant",
								content: isDuplicateCustomer
									? "I found a customer with that email already exists but I couldn't link it automatically. Taking you to the page to verify."
									: "Sorry, I couldn't create the invoice automatically. Please try again.",
							},
						]);
					}
				} catch {
					// Proceed with partial prefill or error handling if creation fails
					// Since we are automating, if main creation fails, we might just show error,
					// but falling back to manual creation page with prefill is a good safety net.
					// For now, let's keep the fallback to prefill if something critical (like customer creation) fails
					// OR if the user wants to manually verify.

					// Actually, the requirement says "completely create the Invoice... and land the user in the invoice page".
					// If creation fails, falling back to create page with pre-fill is the best UX.

					const invDate =
						extracted.date && moment(extracted.date).isValid()
							? moment(extracted.date).format("YYYY-MM-DD")
							: moment().format("YYYY-MM-DD");
					const dueDate = moment(invDate).add(1, "day").format("YYYY-MM-DD");
					const totalAmount =
						extracted.total ?? extracted.line_items.reduce((s, i) => s + i.total, 0);
					const invNumber = extracted.invoice_number || `INV-${Date.now()}`;
					const paymentId = paymentDetails.data?.[0]?.id ?? "";
					const templateId = invoiceSettings?.data?.invoiceTemplateId ?? "";
					const invoiceCurrencyCode = extracted.currency_code?.toUpperCase?.() ?? "";
					const currencyId =
						invoiceCurrencyCode === "EUR"
							? ((
									currencies.data as
										| Array<{ id: string; short_code?: string; code?: string }>
										| undefined
								)?.find(
									(c) =>
										(c.short_code ?? "").toUpperCase() === "EUR" ||
										(c.code ?? "").toUpperCase() === "EUR",
								)?.id ?? "")
							: invoiceCurrencyCode === "INR"
								? ((
										currencies.data as
											| Array<{ id: string; short_code?: string; code?: string }>
											| undefined
									)?.find(
										(c) =>
											(c.short_code ?? "").toUpperCase() === "INR" ||
											(c.code ?? "").toUpperCase() === "INR",
									)?.id ?? "")
								: "";
					const partialPrefill: AiInvoicePrefill = {
						customer_ids: [],
						paymentId: paymentId ?? "",
						template_id: templateId ?? "",
						currency_id: currencyId ?? "",
						date: invDate,
						due_date: dueDate,
						invoice_number: invNumber,
						reference_number: invNumber,
						notes: "",
						sub_total: extracted.subtotal ?? totalAmount,
						total: totalAmount,
						paid_amount: 0,
						due_amount: totalAmount,
						rows: [],
					};
					setPendingInvoiceFromAi(null);
					await queryClient.invalidateQueries({ queryKey: getCustomerControllerFindAllQueryKey() });
					await queryClient.invalidateQueries({ queryKey: getProductControllerFindAllQueryKey() });
					setMessages((prev) => [
						...prev,
						{
							id: `assistant-redirect-${Date.now()}`,
							role: "assistant",
							content: t("yourAi.takingYouToCreateInvoice", {
								defaultValue:
									"I couldn't complete the automatic creation. Taking you to the Create Invoice page with the data I could collect.",
							}),
						},
					]);
					navigate("/invoice/createinvoice", { state: { fromAiPrefill: partialPrefill } });
				}
				setLoading(false);
				return;
			}
			// User replied but not "use first" – clear pending so chat behaves normally; they can add in Settings and try again
			setPendingInvoiceFromAi(null);
		}

		try {
			const payloadMessages: ChatMessagePayload[] = [
				...messages.map((m) => ({ role: m.role, content: m.content })),
				{ role: "user" as const, content: userMsg.content },
			];
			const imageBase64 = userMsg.imageBase64;
			const res = await sendYourAiChat({ messages: payloadMessages, imageBase64 });
			const assistantId = `assistant-${Date.now()}`;
			setMessages((prev) => [
				...prev,
				{ id: assistantId, role: "assistant", content: res.content },
			]);
			setTypingState({ messageId: assistantId, visibleLength: 0 });

			// If user asked to create EXPENSE from the image: extract and navigate to Create Expense with prefill
			if (imageBase64?.length && isCreateExpenseIntent(content) && user?.id) {
				let extractedExpense: ExtractedInvoiceData;
				try {
					extractedExpense = await extractInvoiceDataFromImage(imageBase64);
				} catch (extractErr) {
					const msg = extractErr instanceof Error ? extractErr.message : "Extraction failed";
					AlertService.instance?.errorMessage(msg);
					setMessages((prev) => [
						...prev,
						{
							id: `assistant-expense-extract-err-${Date.now()}`,
							role: "assistant",
							content: t("yourAi.createFromImageFailed", {
								defaultValue:
									"I couldn't extract data from the image. Please try again with a clearer image.",
							}),
						},
					]);
					setLoading(false);
					return;
				}

				// Create or reuse vendor from the bill-to party
				const vendorName = extractedExpense.customer.name;
				const vendorEmail = extractedExpense.customer.email;
				let vendorId = findExistingVendorId(vendorName, vendorEmail);
				if (!vendorId) {
					try {
						const vendorRes = await createVendor.mutateAsync({
							data: {
								user_id: user.id,
								name: vendorName,
								display_name: vendorName,
								email: vendorEmail ?? "",
								phone: extractedExpense.customer.phone ?? null,
								billingAddress:
									extractedExpense.customer.address &&
									extractedExpense.customer.city &&
									extractedExpense.customer.zip
										? ({
												address: extractedExpense.customer.address,
												city: extractedExpense.customer.city,
												zip: extractedExpense.customer.zip,
											} as any)
										: undefined,
							},
						});
						vendorId = (vendorRes as { result?: { id?: string } })?.result?.id ?? "";

						// Ensure subsequent AI runs see this vendor and avoid creating duplicates
						await queryClient.invalidateQueries({
							queryKey: getVendorsControllerFindAllQueryKey(),
						});
					} catch (err) {
						const msg = err instanceof Error ? err.message : "Vendor create failed";
						AlertService.instance?.errorMessage(msg);
					}
				}

				const expenseDate =
					extractedExpense.date && moment(extractedExpense.date).isValid()
						? moment(extractedExpense.date).format("YYYY-MM-DD")
						: moment().format("YYYY-MM-DD");

				const amount =
					extractedExpense.total ?? extractedExpense.line_items.reduce((s, i) => s + i.total, 0);

				const expenseCurrencyCode = extractedExpense.currency_code?.toUpperCase?.() ?? "";
				let expenseCurrencyId = "";
				if (expenseCurrencyCode === "EUR") {
					expenseCurrencyId =
						(
							currencies.data as
								| Array<{ id: string; short_code?: string; code?: string }>
								| undefined
						)?.find(
							(c) =>
								(c.short_code ?? "").toUpperCase() === "EUR" ||
								(c.code ?? "").toUpperCase() === "EUR",
						)?.id ?? "";
				} else if (expenseCurrencyCode === "INR") {
					expenseCurrencyId =
						(
							currencies.data as
								| Array<{ id: string; short_code?: string; code?: string }>
								| undefined
						)?.find(
							(c) =>
								(c.short_code ?? "").toUpperCase() === "INR" ||
								(c.code ?? "").toUpperCase() === "INR",
						)?.id ?? "";
				} else {
					expenseCurrencyId = user.currency_id ?? "";
				}

				let receiptUrl = "";
				if (attachedReceiptFile) {
					try {
						receiptUrl = await uploadReceiptFile(attachedReceiptFile);
					} catch (uploadErr) {
						const msg = uploadErr instanceof Error ? uploadErr.message : "Receipt upload failed";
						AlertService.instance?.errorMessage(msg);
					}
				}

				try {
					await createExpenses.mutateAsync({
						data: {
							receipt_url: receiptUrl,
							category: CreateExpensesDtoCategory.Travel, // Defaulting to Travel if category is not extracted, user can update later
							vendor_id: vendorId || "",
							user_id: user.id,
							expenseDate: formatDateToIso(expenseDate),
							amount: amount,
							currency_id: expenseCurrencyId,
							notes: extractedExpense.notes ?? "",
						},
					});

					setMessages((prev) => [
						...prev,
						{
							id: `assistant-redirect-expense-${Date.now()}`,
							role: "assistant",
							content: t("yourAi.expenseCreated", {
								defaultValue: "I've created the expense for you. Taking you to the Expenses list.",
							}),
						},
					]);

					navigate("/expenses/expenseslist");
				} catch (err) {
					const msg = err instanceof Error ? err.message : "Expense creation failed";
					AlertService.instance?.errorMessage(msg);
					setMessages((prev) => [
						...prev,
						{
							id: `assistant-create-err-${Date.now()}`,
							role: "assistant",
							content: "Sorry, I couldn't create the expense automatically. Please try again.",
						},
					]);
				}

				setLoading(false);
				return;
			}

			// If user asked to create invoice from the image: extract, create what we can, then always navigate with prefill
			if (
				imageBase64?.length &&
				isCreateFromInvoiceIntent(content) &&
				!isCreateExpenseIntent(content) &&
				user?.id
			) {
				let extracted: ExtractedInvoiceData;
				try {
					extracted = await extractInvoiceDataFromImage(imageBase64);
				} catch (extractErr) {
					const msg = extractErr instanceof Error ? extractErr.message : "Extraction failed";
					AlertService.instance?.errorMessage(msg);
					setMessages((prev) => [
						...prev,
						{
							id: `assistant-extract-err-${Date.now()}`,
							role: "assistant",
							content: t("yourAi.createFromImageFailed", {
								defaultValue:
									"I couldn't extract data from the image. Please try again with a clearer image.",
							}),
						},
					]);
					setLoading(false);
					return;
				}

				const unitId = await getOrCreatePcUnitId();
				const paymentId = paymentDetails.data?.[0]?.id ?? "";
				const templateId = invoiceSettings?.data?.invoiceTemplateId ?? "";
				const invoiceCurrencyCode = extracted.currency_code?.toUpperCase?.() ?? "";
				const currencyId =
					invoiceCurrencyCode === "EUR"
						? ((
								currencies.data as
									| Array<{ id: string; short_code?: string; code?: string }>
									| undefined
							)?.find(
								(c) =>
									(c.short_code ?? "").toUpperCase() === "EUR" ||
									(c.code ?? "").toUpperCase() === "EUR",
							)?.id ?? "")
						: invoiceCurrencyCode === "INR"
							? ((
									currencies.data as
										| Array<{ id: string; short_code?: string; code?: string }>
										| undefined
								)?.find(
									(c) =>
										(c.short_code ?? "").toUpperCase() === "INR" ||
										(c.code ?? "").toUpperCase() === "INR",
								)?.id ?? "")
							: "";

				const invDate =
					extracted.date && moment(extracted.date).isValid()
						? moment(extracted.date).format("YYYY-MM-DD")
						: moment().format("YYYY-MM-DD");
				const dueDate = moment(invDate).add(1, "day").format("YYYY-MM-DD");
				const totalAmount =
					extracted.total ?? extracted.line_items.reduce((s, i) => s + i.total, 0);
				const invNumber = extracted.invoice_number || `INV-${Date.now()}`;

				let createdCustomerId: string | null = findExistingCustomerId(
					extracted.customer.name,
					extracted.customer.email,
				);
				const prefillRows: AiInvoicePrefill["rows"] = [];

				if (!createdCustomerId) {
					try {
						const customerRes = await createCustomer.mutateAsync({
							data: {
								user_id: user.id,
								name: extracted.customer.name,
								display_name: extracted.customer.name,
								option: CreateCustomerWithAddressDtoOption.Individual,
								email: extracted.customer.email ?? null,
								phone: extracted.customer.phone ?? null,
								...(currencyId && { currencies_id: currencyId }),
								...(extracted.customer.address &&
									extracted.customer.city &&
									extracted.customer.zip && {
										billingDetails: {
											address: extracted.customer.address,
											city: extracted.customer.city,
											zip: extracted.customer.zip,
											state_name: extracted.customer.state ?? undefined,
											country_name: extracted.customer.country_name ?? undefined,
										},
									}),
							},
						});
						createdCustomerId = customerRes?.result?.id ?? null;
					} catch {
						// Proceed without customer; user will add on Create Invoice page
					}
				}

				// Always build line items when we have unit, currency and extracted items (so grid is never empty when we have data).
				// Reuse existing product by name so we never create duplicates.
				if (unitId && currencyId && extracted.line_items.length > 0) {
					for (let i = 0; i < extracted.line_items.length; i++) {
						const line = extracted.line_items[i];
						const itemName = line.description || `Item ${i + 1}`;
						let pid = findExistingProductId(itemName);
						if (!pid) {
							try {
								const productRes = await createProduct.mutateAsync({
									data: {
										user_id: user.id,
										name: itemName,
										type: CreateProductWithTaxDtoType.Goods,
										unit_id: unitId,
										priceBook: [{ currency_id: currencyId, price: line.unit_price }],
									},
								});
								pid = productRes?.result?.id ?? "";
							} catch {
								// Skip this product; user can add line items on Create Invoice page
							}
						}
						if (pid) {
							prefillRows.push({
								id: `row-${i}-${Date.now()}`,
								product_id: pid,
								product_name: itemName,
								quantity: line.quantity,
								price: line.unit_price,
								total: line.total,
							});
						}
					}
				}

				const prefill: AiInvoicePrefill = {
					customer_ids: createdCustomerId ? [createdCustomerId] : [],
					paymentId: paymentId ?? "",
					template_id: templateId ?? "",
					currency_id: currencyId ?? "",
					date: invDate,
					due_date: dueDate,
					invoice_number: invNumber,
					reference_number: invNumber,
					notes: extracted.notes ?? "",
					sub_total: extracted.subtotal ?? totalAmount,
					total: totalAmount,
					paid_amount: 0,
					due_amount: totalAmount,
					rows: prefillRows,
				};
				await queryClient.invalidateQueries({ queryKey: getCustomerControllerFindAllQueryKey() });
				await queryClient.invalidateQueries({ queryKey: getProductControllerFindAllQueryKey() });
				setMessages((prev) => [
					...prev,
					{
						id: `assistant-redirect-${Date.now()}`,
						role: "assistant",
						content: t("yourAi.takingYouToCreateInvoice", {
							defaultValue:
								"Taking you to the Create Invoice page with the data we collected. You can add any missing details there.",
						}),
					},
				]);
				navigate("/invoice/createinvoice", { state: { fromAiPrefill: prefill } });
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Request failed";
			AlertService.instance?.errorMessage(message);
			setMessages((prev) => [
				...prev,
				{
					id: `assistant-err-${Date.now()}`,
					role: "assistant",
					content: t("yourAi.errorReply", {
						defaultValue: "Sorry, I couldn't process that. Please try again.",
					}),
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				"@keyframes cursor-blink": {
					"0%, 100%": { opacity: 1 },
					"50%": { opacity: 0 },
				},
				display: "flex",
				flexDirection: "column",
				height: "85vh",
				maxHeight: "85vh",
				bgcolor: "background.default",
				borderRadius: 1,
				overflow: "hidden",
			}}
		>
			{/* Messages */}
			<Box
				sx={{
					flex: 1,
					overflowY: "auto",
					overflowX: "hidden",
					px: 2,
					py: 2,
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				{messages.length === 0 && (
					<Box
						sx={{
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							minHeight: 200,
						}}
					>
						<Typography variant="h6" color="text.secondary" textAlign="center">
							{t("yourAi.greeting", {
								defaultValue:
									"Send a message, upload an image, or use voice. I'll respond to everything you share.",
							})}
						</Typography>
					</Box>
				)}
				{messages.map((msg) => (
					<Box
						key={msg.id}
						sx={{
							display: "flex",
							justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
							alignItems: "flex-start",
						}}
					>
						<Paper
							elevation={0}
							sx={{
								maxWidth: "85%",
								width: "fit-content",
								px: 2,
								py: 1.5,
								borderRadius: 2,
								border: "1px solid",
								...(msg.role === "user"
									? {
											bgcolor: "primary.main",
											color: "white",
											borderColor: "primary.main",
										}
									: {
											bgcolor: theme.palette.grey[100],
											color: "text.primary",
											borderColor: "divider",
										}),
							}}
						>
							{((msg.content != null && msg.content !== "") ||
								(msg.role === "assistant" && typingState?.messageId === msg.id)) && (
								<Typography
									variant="body1"
									component="span"
									sx={{ whiteSpace: "pre-wrap", color: msg.role === "user" ? "white" : undefined }}
								>
									{msg.role === "assistant" && typingState?.messageId === msg.id ? (
										<>
											{msg.content.slice(0, typingState.visibleLength)}
											{typingState.visibleLength < msg.content.length && (
												<Box
													component="span"
													sx={{
														ml: 0.25,
														width: 2,
														height: "1em",
														bgcolor: "primary.main",
														animation: "cursor-blink 0.8s step-end infinite",
														verticalAlign: "text-bottom",
														display: "inline-block",
													}}
													aria-hidden
												/>
											)}
										</>
									) : (
										msg.content
									)}
								</Typography>
							)}
							{msg.invoiceId && (
								<Box sx={{ mt: 1.5 }}>
									<Link
										href={`/invoice/invoicedetails/${msg.invoiceId}`}
										onClick={(e) => {
											e.preventDefault();
											navigate(`/invoice/invoicedetails/${msg.invoiceId}`);
										}}
										sx={{ fontWeight: 600 }}
									>
										{t("yourAi.viewInvoice", { defaultValue: "View invoice" })}
									</Link>
								</Box>
							)}
							{msg.imageBase64 && msg.imageBase64.length > 0 && (
								<Box sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}>
									{msg.imageBase64.slice(0, 4).map((b64, i) => (
										<Box
											key={i}
											component="img"
											src={`data:image/jpeg;base64,${b64}`}
											alt=""
											sx={{ width: 64, height: 64, objectFit: "cover", borderRadius: 1 }}
										/>
									))}
									{msg.imageBase64.length > 4 && (
										<Typography variant="caption" sx={{ alignSelf: "center" }}>
											+{msg.imageBase64.length - 4}
										</Typography>
									)}
								</Box>
							)}
						</Paper>
					</Box>
				))}
				{loading && !typingState && (
					<Box sx={{ display: "flex", justifyContent: "flex-start" }}>
						<Paper
							elevation={0}
							sx={{
								px: 2,
								py: 1.5,
								borderRadius: 2,
								bgcolor: theme.palette.grey[100],
								border: "1px solid",
								borderColor: "divider",
							}}
						>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}
							>
								<span>●</span>
								<span>●</span>
								<span>●</span>
							</Typography>
						</Paper>
					</Box>
				)}
				<div ref={messagesEndRef} />
			</Box>

			{/* Attachments preview */}
			{(images.length > 0 || attachedFileName) && (
				<Box
					sx={{
						px: 2,
						py: 0.5,
						display: "flex",
						alignItems: "center",
						gap: 1,
						flexWrap: "wrap",
						bgcolor: "background.paper",
						borderTop: "1px solid",
						borderColor: "divider",
					}}
				>
					{images.map((img, i) => (
						<Box key={i} sx={{ position: "relative" }}>
							<Box
								component="img"
								src={`data:image/jpeg;base64,${img.base64}`}
								alt=""
								sx={{ width: 40, height: 40, objectFit: "cover", borderRadius: 1 }}
							/>
							<IconButton
								size="small"
								sx={{
									position: "absolute",
									top: -8,
									right: -8,
									bgcolor: "grey.500",
									color: "white",
									"&:hover": { bgcolor: "grey.700" },
									width: 20,
									height: 20,
								}}
								onClick={() => removeImage(i)}
							>
								×
							</IconButton>
						</Box>
					))}
					{attachedFileName && (
						<Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							📎 {attachedFileName}
							<IconButton
								size="small"
								onClick={() => setAttachedFileName(null)}
								sx={{ width: 20, height: 20 }}
							>
								×
							</IconButton>
						</Typography>
					)}
				</Box>
			)}

			{/* Input area */}
			<Paper
				elevation={2}
				sx={{
					p: 1.5,
					borderRadius: 0,
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5 }}>
					<TextField
						multiline
						maxRows={4}
						placeholder={t("yourAi.placeholder", { defaultValue: "Type a message..." })}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
						disabled={loading}
						variant="outlined"
						size="small"
						sx={{ flex: 1 }}
					/>
					<input
						type="file"
						accept="image/*"
						multiple
						hidden
						id="your-ai-image-input"
						onChange={handleImageSelect}
					/>
					<input type="file" hidden id="your-ai-file-input" onChange={handleFileSelect} />
					<IconButton
						component="label"
						htmlFor="your-ai-image-input"
						size="small"
						title={t("yourAi.attachImage", { defaultValue: "Attach image" })}
					>
						<ImageIcon />
					</IconButton>
					<IconButton
						component="label"
						htmlFor="your-ai-file-input"
						size="small"
						title={t("yourAi.attachFile", { defaultValue: "Attach file" })}
					>
						<AttachFileIcon />
					</IconButton>
					<IconButton
						size="small"
						onClick={listening ? stopListening : startListening}
						title={t("yourAi.voice", { defaultValue: "Voice input" })}
						color={listening ? "error" : "default"}
					>
						{listening ? <MicOffIcon /> : <MicIcon />}
					</IconButton>
					<IconButton
						color="primary"
						onClick={handleSend}
						disabled={loading || (!input.trim() && images.length === 0)}
						size="small"
						title={t("app.send", { defaultValue: "Send" })}
					>
						<SendIcon />
					</IconButton>
				</Box>
			</Paper>
		</Box>
	);
}
