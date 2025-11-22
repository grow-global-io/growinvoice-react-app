import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { type FormikProps } from "formik";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
	useInvoiceControllerCreate,
	useInvoiceControllerUpdate,
	getInvoiceControllerFindAllQueryKey,
	getInvoiceControllerFindDueInvoicesQueryKey,
	getInvoiceControllerFindOneQueryKey,
	getInvoiceControllerFindPaidInvoicesQueryKey,
	getInvoiceControllerTestQueryKey,
	getInvoiceControllerInvoiceCountQueryKey,
	getInvoiceControllerTotalDueQueryKey,
	getInvoiceControllerOutstandingReceivableQueryKey,
	getInvoiceControllerFindDueTodayQueryKey,
	getInvoiceControllerFindDueMonthQueryKey,
	getInvoiceControllerInvoicePublicFindOneQueryKey,
} from "@api/services/invoice";
import { useCustomerControllerFindAll } from "@api/services/customer";
import { CreateInvoiceWithProductsRecurring } from "@api/services/models";
import { formatDateToIso } from "@shared/formatter";
import moment from "moment";
import { AlertService } from "@shared/services/AlertService";
import { type GridRowsProp } from "@mui/x-data-grid";
import type { OmitCreateInvoiceProductsExtended } from "../CreateInvoice";
import { useInvoiceHook } from "../invoiceHooks/useInvoiceHook";

interface SaveAndSendInvoiceButtonProps {
	formik: FormikProps<any>;
	rows: GridRowsProp<OmitCreateInvoiceProductsExtended>;
	invoiceId?: string;
	onValidationError: (message: string) => void;
}

const SaveAndSendInvoiceButton = ({
	formik,
	rows,
	invoiceId,
	onValidationError,
}: SaveAndSendInvoiceButtonProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);
	const createInvoice = useInvoiceControllerCreate();
	const updateInvoice = useInvoiceControllerUpdate();
	const customerData = useCustomerControllerFindAll();
	const { handleSendMail } = useInvoiceHook();
	const currentDate = moment().format("YYYY-MM-DD");

	const handleSaveAndSend = async () => {
		if (rows?.length === 0) {
			onValidationError(t("invoiceForm.validation.atLeastOneProduct"));
			return;
		} else if (rows?.find((row) => row.product_id === "")) {
			onValidationError(t("invoiceForm.validation.fillAllProductDetails"));
			return;
		}

		if (!formik.isValid) {
			await formik.validateForm();
			return;
		}

		setIsLoading(true);
		try {
			const values = formik.values;
			const invIds = [];
			if (invoiceId) {
				invIds.push(invoiceId);
			}

			// Save the invoice first
			if (invoiceId) {
				// Update existing invoice
				await updateInvoice.mutateAsync({
					id: invoiceId,
					data: {
						...values,
						recurring: values.recurring as CreateInvoiceWithProductsRecurring,
						date: formatDateToIso(values.date),
						due_date: formatDateToIso(values.due_date),
						due_amount: values.total,
						paid_amount: 0,
						product: rows.map((row) => ({
							...row,
							taxes: row.taxes?.length ? row.taxes : undefined,
						})),
					},
				});
			} else {
				// Create new invoice
				// Use fresh timestamp for invoice_number to match other invoices format
				const currentTimestamp = new Date().getTime().toString();
				const response = await createInvoice.mutateAsync({
					data: {
						...values,
						invoice_number: currentTimestamp,
						reference_number: values?.reference_number
							? values?.reference_number
							: currentTimestamp,
						recurring: values.recurring as CreateInvoiceWithProductsRecurring,
						date: formatDateToIso(values.date),
						due_date: formatDateToIso(values.due_date),
						due_amount: values.total,
						paid_amount: 0,
						product: rows.map((row) => ({
							...row,
							taxes: row.taxes?.length ? row.taxes : undefined,
						})),
					},
				});

				// Extract invoice ID from response
				// Response structure: { message: string, result?: InvoiceDto }
				// InvoiceDto has id: string
				response.result?.forEach((inv) => invIds.push(inv.id));
			}

			if (invIds.length === 0) {
				AlertService.instance.errorMessage(
					t("invoiceForm.errors.saveFailed", { defaultValue: "Failed to save invoice" }),
				);
				setIsLoading(false);
				return;
			}

			// Refetch queries after saving
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindOneQueryKey(invIds[0]),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindAllQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerTestQueryKey(invIds[0]),
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
				queryKey: getInvoiceControllerFindDueTodayQueryKey({ date: formatDateToIso(currentDate) }),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindDueMonthQueryKey({ date: formatDateToIso(currentDate) }),
			});

			// Check if customer email exists before sending
			const customerIds = invoiceId ? [values.customer_id] : values.customer_ids;

			for (const customerId of customerIds) {
				const customer = customerData?.data?.find((c) => c.id === customerId);
				if (!customer?.email) {
					AlertService.instance.errorMessage(
						t("invoice.detail.customerEmailNotFound", {
							defaultValue: "Customer email not found. Invoice saved but not sent.",
						}),
					);
					formik.resetForm();
					navigate("/invoice/invoicelist");
					return;
				}
			}

			// Send email with translations using the hook's handleSendMail function
			const emailPromises: Promise<any>[] = [];
			if (invIds.length) {
				invIds.forEach((inv) => emailPromises.push(handleSendMail(inv)));

				//Send emails
				await Promise.all(emailPromises);
			}

			// Refetch queries after sending email
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerInvoicePublicFindOneQueryKey(invIds[0]),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindAllQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerTestQueryKey(invIds[0]),
			});

			AlertService.instance.success(
				"invoiceForm.success.saveAndSend",
				t("invoiceForm.success.saveAndSend", {
					defaultValue: "Invoice saved and sent successfully!",
				}),
			);

			// Reset form and navigate
			formik.resetForm();
			navigate("/invoice/invoicelist");
		} catch (error: any) {
			AlertService.instance.errorMessage(
				error?.response?.data?.message ||
					t("invoiceForm.errors.saveAndSendFailed", {
						defaultValue: "Failed to save and send invoice",
					}),
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant="contained"
			color="primary"
			onClick={handleSaveAndSend}
			disabled={isLoading || formik.isValid === false || rows?.length === 0}
		>
			{t("invoiceForm.saveAndSendInvoice", { defaultValue: "Save and Send Invoice" })}
		</Button>
	);
};

export default SaveAndSendInvoiceButton;
