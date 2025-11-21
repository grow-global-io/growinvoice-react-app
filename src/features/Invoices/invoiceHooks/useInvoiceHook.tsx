import {
	getInvoiceControllerFindAllQueryKey,
	getInvoiceControllerFindDueInvoicesQueryKey,
	getInvoiceControllerFindDueMonthQueryKey,
	getInvoiceControllerFindDueTodayQueryKey,
	getInvoiceControllerFindPaidInvoicesQueryKey,
	getInvoiceControllerInvoiceCountQueryKey,
	getInvoiceControllerInvoicePublicFindOneQueryKey,
	getInvoiceControllerOutstandingReceivableQueryKey,
	getInvoiceControllerTestQueryKey,
	getInvoiceControllerTotalDueQueryKey,
	invoiceControllerInvoicePublicFindOne,
	invoiceControllerInvoiceSentToMail,
	useInvoiceControllerBulkInvoiceSentToMail,
	useInvoiceControllerMarkedAsMailed,
	useInvoiceControllerMarkedAsPaid,
	useInvoiceControllerRemove,
} from "@api/services/invoice";
import {
	paymentsControllerRazorpayPayment,
	paymentsControllerSuccessRazorpay,
	paymentsControllerSuccessrazorpayPayment,
	usePaymentsControllerGrowlimitlessPayment,
	usePaymentsControllerRazorpayPaymentForPlans,
	usePaymentsControllerStripePayment,
} from "@api/services/payments";
import { formatDateToIso } from "@shared/formatter";
import { LoaderService } from "@shared/services/LoaderService";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useCallback } from "react";
import useRazorpay, { type RazorpayOptions } from "react-razorpay";
import { useNavigate } from "react-router-dom";
import i18n from "../../../i18s";

export const useInvoiceHook = () => {
	const [Razorpay] = useRazorpay();
	const navigate = useNavigate();
	const removeInvoice = useInvoiceControllerRemove();
	const currentDate = moment().format("YYYY-MM-DD");
	const queryClient = useQueryClient();
	const markedPaid = useInvoiceControllerMarkedAsPaid();
	const markedMailedSent = useInvoiceControllerMarkedAsMailed();
	const createstripPaymentUrl = usePaymentsControllerStripePayment();
	const createGllPaymentUrl = usePaymentsControllerGrowlimitlessPayment();
	const createRazorpaymentForPlans = usePaymentsControllerRazorpayPaymentForPlans();
	const handleRedirectStripePayment = async (invoiceId: string, user_id: string) => {
		const params = { invoice_id: invoiceId, user_id };
		const response = await createstripPaymentUrl.mutateAsync({ params });
		window.location.href = response;
	};

	const handleRedirectGllPayment = async (invoiceId: string, user_id: string) => {
		const params = { invoice_id: invoiceId, user_id };
		const response = await createGllPaymentUrl.mutateAsync({ params });
		window.location.href = response as unknown as string;
	};

	const handleRazorPayPayment = useCallback(
		async ({
			invoiceId,
			userId,
			razorpaykey,
		}: {
			invoiceId: string;
			userId: string;
			razorpaykey: string;
		}) => {
			const getOrderDetails = await paymentsControllerRazorpayPayment({
				invoice_id: invoiceId,
				user_id: userId,
			});
			const options: RazorpayOptions = {
				key: razorpaykey,
				amount: getOrderDetails?.amount.toLocaleString(),
				currency: getOrderDetails?.currency,
				name: "Invoice Payment",
				description: "Invoice Payment for the invoice number " + getOrderDetails?.receipt,
				order_id: getOrderDetails?.id,
				handler: async (res) => {
					LoaderService.instance.showLoader();
					const paymentId = res.razorpay_payment_id;
					const paymentSubmit = await paymentsControllerSuccessRazorpay({
						invoice_id: invoiceId,
						user_id: userId,
						razorpay_payment_id: paymentId,
					});
					LoaderService.instance.hideLoader();
					if (paymentSubmit) {
						navigate("/invoice/invoicetemplate/" + invoiceId);
						window.location.reload();
					}
				},
				notes: {
					address: "Growinvoice",
				},
				theme: {
					color: "#3399cc",
				},
			};

			const rzpay = new Razorpay(options);
			rzpay.open();
		},
		[Razorpay],
	);

	const handleRazorPayPaymentForPlans = async (
		planId: string,
		userId: string,
		razorpaykey: string,
	) => {
		const getOrderDetails = await createRazorpaymentForPlans.mutateAsync({
			params: {
				plan_id: planId,
				user_id: userId,
			},
		});
		const options: RazorpayOptions = {
			key: razorpaykey,
			amount: getOrderDetails?.amount.toLocaleString(),
			currency: getOrderDetails?.currency,
			name: "Plan Payment",
			description: "Plan Payment for the plan number " + getOrderDetails?.receipt,
			order_id: getOrderDetails?.id,
			handler: async (res) => {
				LoaderService.instance.showLoader();
				const paymentId = res.razorpay_payment_id;
				LoaderService.instance.hideLoader();
				await paymentsControllerSuccessrazorpayPayment({
					plan_id: planId,
					user_id: userId,
					razorpay_payment_id: paymentId,
				});
				// const paymentSubmit = await paymentsControllerSuccessRazorpay({
				// 	invoice_id: invoiceId,
				// 	user_id: userId,
				// 	razorpay_payment_id: paymentId,
				// });
				// if (paymentSubmit) {
				// 	navigate("/invoice/invoicetemplate/" + invoiceId);
				// 	window.location.reload();
				// }
			},
			notes: {
				address: "Growinvoice",
			},
			theme: {
				color: "#3399cc",
			},
		};

		const rzpay = new Razorpay(options);
		rzpay.open();
	};

	const handleEdit = (invoiceId: string) => {
		navigate(`/invoice/createinvoice/${invoiceId}`);
	};

	const handleView = (invoiceId: string) => {
		navigate(`/invoice/invoicedetails/${invoiceId}`);
	};

	const handleDelete = async (invoiceId: string) => {
		await removeInvoice.mutateAsync({ id: invoiceId });
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindAllQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
		});
		await queryClient.refetchQueries({
			queryKey: getInvoiceControllerInvoiceCountQueryKey(),
		});
		await queryClient.refetchQueries({
			queryKey: getInvoiceControllerTotalDueQueryKey(),
		});
		await queryClient.refetchQueries({
			queryKey: getInvoiceControllerOutstandingReceivableQueryKey(),
		});
		await queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindDueTodayQueryKey({
				date: formatDateToIso(currentDate),
			}),
		});
		await queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindDueMonthQueryKey({
				date: formatDateToIso(currentDate),
			}),
		});
	};
	const sendMail = useInvoiceControllerBulkInvoiceSentToMail();
	// Helper function to send invoice email with translations
	const sendInvoiceEmail = async (invoiceId: string) => {
		try {
			// Fetch invoice data to get customer email and details
			const invoiceData = await invoiceControllerInvoicePublicFindOne(invoiceId);

			const customerEmail = invoiceData?.customer?.email;
			if (!customerEmail) {
				console.warn("Customer email not found, invoice not sent");
				return;
			}

			// Get current language - check localStorage first (user manual selection), then i18n
			let currentLanguage = "en";
			if (typeof window !== "undefined") {
				// Check if user manually changed language (stored in i18n or localStorage)
				const storedLang = localStorage.getItem("i18nextLng");
				currentLanguage = i18n.language || storedLang || "en";

				// If stored language differs from i18n language, change it
				if (storedLang && i18n.language !== storedLang) {
					await i18n.changeLanguage(storedLang);
					currentLanguage = storedLang;
				}
			} else {
				currentLanguage = i18n.language || i18n.options?.lng || "en";
			}

			// Ensure language is set first
			if (i18n.language !== currentLanguage) {
				await i18n.changeLanguage(currentLanguage);
			}
			// Ensure translations are loaded for the current language
			await i18n.loadNamespaces("translation");

			// Wait for resources to be available
			let retries = 0;
			while (retries < 10) {
				const resources = i18n.getResourceBundle(currentLanguage, "translation");
				if (resources && resources.invoice && resources.invoice.invoiceEmail) {
					break;
				}
				await new Promise((resolve) => setTimeout(resolve, 100));
				retries++;
			}

			// Use i18n.t() directly with explicit language to ensure correct translation
			const getTranslation = (key: string, defaultValue: string, options?: any): string => {
				try {
					// First, try to access translation resources directly
					const resources = i18n.getResourceBundle(currentLanguage, "translation");
					if (resources) {
						// Navigate through the key path (e.g., "invoice.invoiceEmail.intro")
						const keys = key.split(".");
						let value: any = resources;
						for (const k of keys) {
							if (value && typeof value === "object" && k in value) {
								value = value[k];
							} else {
								value = null;
								break;
							}
						}

						// If we found a translation, use it
						if (value && typeof value === "string") {
							// Replace placeholders manually
							let result = value;
							if (options) {
								Object.keys(options).forEach((optKey) => {
									result = result.replace(new RegExp(`\\{${optKey}\\}`, "g"), options[optKey]);
									result = result.replace(
										new RegExp(`\\{\\{${optKey}\\}\\}`, "g"),
										options[optKey],
									);
								});
							}
							return result;
						}
					}

					// Fallback 1: Try i18n.t() with explicit language
					let translation = i18n.t(key, {
						...options,
						lng: currentLanguage,
						defaultValue,
						returnObjects: false,
					});

					// Fallback 2: If we got the key back or defaultValue, try without lng parameter
					if (translation === key || (translation === defaultValue && key.includes("."))) {
						translation = i18n.t(key, {
							...options,
							defaultValue,
							returnObjects: false,
						});
					}

					// Ensure we always return a string (not the key itself)
					let result = typeof translation === "string" ? translation : defaultValue;

					// If result is still the key, return defaultValue
					if (result === key) {
						result = defaultValue;
					}

					return result;
				} catch (error) {
					console.warn(`Translation error for key ${key}:`, error);
					return defaultValue;
				}
			};

			// Invoice details
			const invoiceLink = `${window.location.origin}/invoice/invoicetemplate/${invoiceId}`;
			const invoiceNumber = invoiceData?.invoice_number || invoiceId;
			const customerName = invoiceData?.customer?.name || "Customer";
			const companyName = (invoiceData?.user as any)?.company?.[0]?.name || "Company";
			const contactEmail =
				(invoiceData?.user as any)?.company?.[0]?.email || (invoiceData?.user as any)?.email || "";
			const invoiceDate = invoiceData?.date
				? new Date(invoiceData.date).toLocaleDateString(
						currentLanguage === "fi" ? "fi-FI" : currentLanguage === "est" ? "et-EE" : "en-US",
						{
							year: "numeric",
							month: "long",
							day: "numeric",
						},
					)
				: "";
			const dueDate = invoiceData?.due_date
				? new Date(invoiceData.due_date).toLocaleDateString(
						currentLanguage === "fi" ? "fi-FI" : currentLanguage === "est" ? "et-EE" : "en-US",
						{
							year: "numeric",
							month: "long",
							day: "numeric",
						},
					)
				: "";
			const amount = invoiceData?.total || 0;
			const currencyCode = invoiceData?.currency?.short_code || "USD";
			const paidStatus = invoiceData?.paid_status || "Unpaid";

			// Format currency
			const formattedAmount = new Intl.NumberFormat(
				currentLanguage === "fi" ? "fi-FI" : currentLanguage === "est" ? "et-EE" : "en-US",
				{
					style: "currency",
					currency: currencyCode,
				},
			).format(amount);

			// Get translated status
			const statusKey = paidStatus?.toLowerCase().replace(/\s+/g, "") || "";
			const translatedStatus = getTranslation(`invoice.paymentStatus.${statusKey}`, paidStatus);

			// Get translated greeting
			const greetingTranslation = getTranslation(
				"invoice.invoiceEmail.greeting",
				`Hello ${customerName},`,
				{
					customerName,
				},
			);
			const finalGreeting = greetingTranslation
				.replace(/\{customerName\}/g, customerName)
				.replace(/\{\{customerName\}\}/g, customerName);

			// Get translated intro
			const introTranslation = getTranslation(
				"invoice.invoiceEmail.intro",
				`You have received a new invoice from ${companyName}. Please review the invoice details below and use the button to view or download the invoice.`,
				{ companyName },
			);
			const finalIntro = introTranslation.replace(/\{companyName\}/g, companyName);

			// Get translated questions
			const questionsTranslation = getTranslation(
				"invoice.invoiceEmail.questions",
				`If you have any questions, contact us at ${contactEmail}.`,
				{ contactEmail },
			);
			const finalQuestions = questionsTranslation.replace(/\{contactEmail\}/g, contactEmail);

			// Get translated signature
			const signatureTranslation = getTranslation(
				"invoice.invoiceEmail.signature",
				`Best regards,<br/>${companyName}`,
				{ companyName },
			);
			const finalSignature = signatureTranslation.replace(/\{companyName\}/g, companyName);

			// Build email body
			const invoiceBody = `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background-color: #3399cc; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
						<h1 style="margin: 0; font-size: 24px; font-weight: bold;">${companyName}</h1>
						<p style="margin: 5px 0 0 0; font-size: 14px;">${getTranslation("invoice.invoiceEmail.title", "Invoice notification")}</p>
					</div>
					<div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
						<p style="font-size: 16px; color: #333; line-height: 1.6;">
							${finalGreeting}
						</p>
						<p style="font-size: 16px; color: #555; line-height: 1.6;">
							${finalIntro}
						</p>
						<div style="background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
							<h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333;">
								${getTranslation("invoice.invoiceEmail.invoiceNumber", "Invoice #{invoiceNumber}", { invoiceNumber }).replace(/\{invoiceNumber\}/g, invoiceNumber)}
							</h2>
							<p style="margin: 10px 0; font-size: 14px; color: #555;">
								<strong>${getTranslation("invoice.invoiceEmail.status", "Status:")}</strong> 
								<span style="color: #3399cc;">${translatedStatus}</span>
							</p>
							<p style="margin: 10px 0; font-size: 14px; color: #555;">
								<strong>${getTranslation("invoice.invoiceEmail.amount", "Amount:")}</strong> ${formattedAmount}
							</p>
							<p style="margin: 10px 0; font-size: 14px; color: #555;">
								<strong>${getTranslation("invoice.invoiceEmail.date", "Date:")}</strong> ${invoiceDate}
							</p>
							<p style="margin: 10px 0; font-size: 14px; color: #555;">
								<strong>${getTranslation("invoice.invoiceEmail.dueDate", "Due date:")}</strong> ${dueDate}
							</p>
							<div style="text-align: center; margin: 20px 0;">
								<a href="${invoiceLink}" style="
									display: inline-block;
									padding: 12px 30px;
									font-size: 16px;
									color: white;
									background-color: #3399cc;
									text-decoration: none;
									border-radius: 5px;
									font-weight: bold;
								">
									${getTranslation("invoice.invoiceEmail.viewDownloadButton", "View & Download Invoice")}
								</a>
							</div>
							<p style="margin: 15px 0 5px 0; font-size: 12px; color: #777;">
								${getTranslation("invoice.invoiceEmail.invoiceNumberLabel", "Invoice number:")} ${invoiceNumber}
							</p>
							<p style="margin: 5px 0; font-size: 12px; color: #777;">
								${getTranslation("invoice.invoiceEmail.linkInstructions", "If the link does not work, copy & paste this URL into your browser:")}
							</p>
							<p style="margin: 5px 0; font-size: 12px; color: #3399cc; word-break: break-all;">
								${invoiceLink}
							</p>
						</div>
						<p style="font-size: 14px; color: #777; line-height: 1.6;">
							${finalQuestions}
						</p>
						<p style="font-size: 14px; color: #777; line-height: 1.6;">
							${finalSignature}
						</p>
					</div>
				</div>
			`;

			// Get translated subject
			const subjectTranslation = getTranslation(
				"invoice.invoiceEmail.subject",
				`Invoice #${invoiceNumber} from ${companyName}`,
				{ invoiceNumber, companyName },
			);
			const finalSubject = subjectTranslation
				.replace(/\{invoiceNumber\}/g, invoiceNumber)
				.replace(/\{companyName\}/g, companyName);

			// Send email
			await invoiceControllerInvoiceSentToMail(
				{
					email: customerEmail,
					subject: finalSubject,
					body: invoiceBody,
				},
				{
					id: invoiceId,
				},
			);
		} catch (error) {
			console.error("Error sending invoice email:", error);
			throw error; // Re-throw to allow caller to handle
		}
	};

	const handleSendMail = async (invoiceId: string) => {
		try {
			// Send invoice email with translations
			await sendInvoiceEmail(invoiceId);
		} catch (error) {
			// If custom email fails, fall back to backend email
			console.warn("Custom invoice email failed, falling back to backend email:", error);
			await sendMail.mutateAsync({
				params: {
					ids: [invoiceId],
				},
			});
		}
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerInvoicePublicFindOneQueryKey(invoiceId ?? ""),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindAllQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
		});

		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
		});

		queryClient.refetchQueries({
			queryKey: getInvoiceControllerTestQueryKey(invoiceId),
		});
	};

	const refetchQueries = async (invoiceId: string) => {
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerInvoicePublicFindOneQueryKey(invoiceId ?? ""),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindAllQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
		});

		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
		});

		queryClient.refetchQueries({
			queryKey: getInvoiceControllerTestQueryKey(invoiceId),
		});
	};

	const handleShare = (invoiceId: string) => {
		navigate(`/invoice/invoicetemplate/${invoiceId}`);
	};

	// Helper function to send receipt email
	const sendReceiptEmail = async (invoiceId: string) => {
		try {
			// Fetch invoice data to get customer email
			const invoiceData = await invoiceControllerInvoicePublicFindOne(invoiceId);

			const customerEmail = invoiceData?.customer?.email;
			if (!customerEmail) {
				console.warn("Customer email not found, receipt not sent");
				return;
			}

			// Ensure i18n is initialized and get current language
			const currentLanguage = i18n.language || i18n.options?.lng || "en";
			// Ensure translations are loaded for the current language
			await i18n.loadNamespaces("translation");

			// Send receipt email
			const invoiceLink = `${window.location.origin}/invoice/invoicetemplate/${invoiceId}`;
			const invoiceNumber = invoiceData?.invoice_number || invoiceId;
			const customerName = invoiceData?.customer?.name || "Customer";

			// Use i18n.t() directly with explicit language to ensure correct translation
			const getTranslation = (key: string, defaultValue: string, options?: any): string => {
				const translation = i18n.t(key, { ...options, lng: currentLanguage, defaultValue });
				// Ensure we always return a string
				return typeof translation === "string" ? translation : defaultValue;
			};

			// Get translated greeting and ensure customerName is replaced
			const greetingTranslation = getTranslation(
				"invoice.receiptEmail.greeting",
				`Dear ${customerName},`,
				{
					customerName,
				},
			);
			// Manually replace placeholder in case i18next interpolation doesn't work
			const finalGreeting = greetingTranslation
				.replace(/\{customerName\}/g, customerName)
				.replace(/\{\{customerName\}\}/g, customerName)
				.replace(/\{\{customer nme\}\}/g, customerName)
				.replace(/\{customer nme\}/g, customerName);

			// Get translated thankYou message and ensure invoiceNumber is replaced
			const thankYouTranslation = getTranslation(
				"invoice.receiptEmail.thankYou",
				`Thank you! Your invoice #${invoiceNumber} has been successfully paid.`,
				{ invoiceNumber },
			);
			// Manually replace invoiceNumber placeholder in case i18next interpolation doesn't work
			const finalThankYou = thankYouTranslation
				.replace(/\{invoiceNumber\}/g, invoiceNumber)
				.replace(/\{\{invoiceNumber\}\}/g, invoiceNumber)
				.replace(/#\{invoiceNumber\}/g, `#${invoiceNumber}`);

			const receiptBody = `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<h2 style="color: #333; text-align: center;">${getTranslation("invoice.receiptEmail.title", "Payment Receipt")}</h2>
					<p style="font-size: 16px; color: #555; line-height: 1.6;">
						${finalGreeting}
					</p>
					<p style="font-size: 16px; color: #555; line-height: 1.6;">
						${finalThankYou}
					</p>
					<p style="font-size: 16px; color: #555; line-height: 1.6;">
						${getTranslation("invoice.receiptEmail.appreciation", "We appreciate your prompt payment and your business with us.")}
					</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${invoiceLink}" style="
							display: inline-block;
							padding: 12px 30px;
							font-size: 16px;
							color: white;
							background-color: #3399cc;
							text-decoration: none;
							border-radius: 5px;
							font-weight: bold;
						">
							${getTranslation("invoice.receiptEmail.viewReceipt", "View Receipt")}
						</a>
					</div>
					<p style="font-size: 14px; color: #777; line-height: 1.6;">
						${getTranslation("invoice.receiptEmail.questions", "If you have any questions or concerns, please don't hesitate to contact us.")}
					</p>
					<p style="font-size: 14px; color: #777; line-height: 1.6;">
						${getTranslation("invoice.receiptEmail.signature", "Best regards,<br/>Growinvoice Team")}
					</p>
				</div>
			`;

			// Get translated subject and ensure invoiceNumber is replaced
			const subjectTranslation = getTranslation(
				"invoice.receiptEmail.subject",
				`Payment Receipt - Invoice #${invoiceNumber}`,
				{ invoiceNumber },
			);
			// Manually replace invoiceNumber placeholder in case i18next interpolation doesn't work
			const finalSubject = subjectTranslation
				.replace(/\{invoiceNumber\}/g, invoiceNumber)
				.replace(/\{\{invoiceNumber\}\}/g, invoiceNumber)
				.replace(/#\{invoiceNumber\}/g, `#${invoiceNumber}`);

			await invoiceControllerInvoiceSentToMail(
				{
					email: customerEmail,
					subject: finalSubject,
					body: receiptBody,
				},
				{
					id: invoiceId,
				},
			);
		} catch (error) {
			console.error("Error sending receipt email:", error);
			// Don't show error to user as payment was successful
		}
	};

	const handlePaid = async (invoiceId: string) => {
		await markedPaid.mutateAsync({
			params: {
				id: invoiceId,
			},
		});
		refetchQueries(invoiceId);

		// Auto-send receipt email to customer
		await sendReceiptEmail(invoiceId);
	};

	const handleMailedSent = async (invoiceId: string) => {
		await markedMailedSent.mutateAsync({
			params: {
				id: invoiceId,
			},
		});
		refetchQueries(invoiceId);
	};

	return {
		handleRedirectStripePayment,
		handleEdit,
		handleView,
		handleDelete,
		handleSendMail,
		handleShare,
		handlePaid,
		handleMailedSent,
		handleRazorPayPayment,
		handleRedirectGllPayment,
		handleRazorPayPaymentForPlans,
		sendReceiptEmail,
		sendInvoiceEmail,
	};
};
