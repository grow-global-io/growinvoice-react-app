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
	const handleSendMail = async (invoiceId: string) => {
		await sendMail.mutateAsync({
			params: {
				ids: [invoiceId],
			},
		});
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

			// Send receipt email
			const invoiceLink = `${window.location.origin}/invoice/invoicetemplate/${invoiceId}`;
			const receiptBody = `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<h2 style="color: #333; text-align: center;">Payment Receipt</h2>
					<p style="font-size: 16px; color: #555; line-height: 1.6;">
						Dear ${invoiceData?.customer?.name || "Customer"},
					</p>
					<p style="font-size: 16px; color: #555; line-height: 1.6;">
						Thank you! Your invoice <strong>#${invoiceData?.invoice_number || invoiceId}</strong> has been successfully paid.
					</p>
					<p style="font-size: 16px; color: #555; line-height: 1.6;">
						We appreciate your prompt payment and your business with us.
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
							View Invoice
						</a>
					</div>
					<p style="font-size: 14px; color: #777; line-height: 1.6;">
						If you have any questions or concerns, please don't hesitate to contact us.
					</p>
					<p style="font-size: 14px; color: #777; line-height: 1.6;">
						Best regards,<br/>
						Growinvoice Team
					</p>
				</div>
			`;

			await invoiceControllerInvoiceSentToMail(
				{
					email: customerEmail,
					subject: `Payment Receipt - Invoice #${invoiceData?.invoice_number || invoiceId}`,
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
	};
};
