import {
	getInvoiceControllerFindDueInvoicesQueryKey,
	getInvoiceControllerFindPaidInvoicesQueryKey,
	getInvoiceControllerInvoicePublicFindOneQueryKey,
	getInvoiceControllerTestQueryKey,
	invoiceControllerInvoicePublicFindOne,
	invoiceControllerInvoiceSentToMail,
	useInvoiceControllerFindDueInvoices,
} from "@api/services/invoice";
import { type CreatePaymentsDto } from "@api/services/models";
import { useAuthStore } from "@store/auth";
import * as Yup from "yup";
import { useCreatePaymentStore } from "@store/createPaymentStore";
import { Box, Button, Divider, Grid, IconButton, Typography } from "@mui/material";
import { Constants } from "@shared/constants";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { type ListDto } from "@shared/models/ListDto";
import { usePaymentdetailsControllerFindAll } from "@api/services/paymentdetails";
import { useDialog } from "@shared/hooks/useDialog";
import PaymentDetailsDrawer from "@features/PaymentsDetails/PaymentDetailsDrawer";
import AddIcon from "@mui/icons-material/Add";
import {
	getPaymentsControllerFindAllQueryKey,
	usePaymentsControllerCreate,
} from "@api/services/payments";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const PaymentForm = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { invoiceId, setOpenPaymentForm } = useCreatePaymentStore.getState();
	const paymentData = usePaymentdetailsControllerFindAll();
	const { user } = useAuthStore();
	const { open, handleClickOpen, handleClose } = useDialog();
	const createPayment = usePaymentsControllerCreate();

	const invoiceData = useInvoiceControllerFindDueInvoices();

	const initialValues: CreatePaymentsDto = {
		amount: invoiceData?.data?.find((invoice) => invoice.id === invoiceId)?.total ?? 0,
		invoice_id: invoiceId ?? "",
		paymentDetails_id: "",
		user_id: user?.id ?? "",
		notes: "",
		paymentDate: new Date().toISOString(),
		private_notes: "",
		reference_number: "",
	};

	const schema: Yup.Schema<CreatePaymentsDto> = Yup.object({
		amount: Yup.number()
			.required(t("paymentForm.validation.amountRequired"))
			.test("amount", t("paymentForm.validation.amountLteInvoice"), function (value) {
				const invoice = invoiceData?.data?.find((invoice) => invoice.id === invoiceId);
				console.log("value", value, invoice);
				if (invoice && value > 0) {
					return value <= invoice.due_amount;
				}
				return true;
			})
			.min(1, t("paymentForm.validation.amountMin")),
		invoice_id: Yup.string().required(t("paymentForm.validation.invoiceRequired")),
		paymentDetails_id: Yup.string().required(t("paymentForm.validation.paymentDetailsRequired")),
		user_id: Yup.string().required(t("paymentForm.validation.userRequired")),
		notes: Yup.string().nullable(),
		paymentDate: Yup.string().required(t("paymentForm.validation.paymentDateRequired")),
		private_notes: Yup.string().nullable(),
		reference_number: Yup.string().nullable(),
	});

	const handleSubmit = async (
		values: CreatePaymentsDto,
		{ setSubmitting }: FormikHelpers<CreatePaymentsDto>,
	) => {
		await createPayment.mutateAsync({
			data: {
				...values,
				reference_number: values?.reference_number?.toString() ?? null,
			},
		});

		// Refetch queries to get updated invoice status
		await queryClient.refetchQueries({
			queryKey: getPaymentsControllerFindAllQueryKey(),
		});
		await queryClient.refetchQueries({
			queryKey: getInvoiceControllerTestQueryKey(invoiceId ?? ""),
		});
		await queryClient.refetchQueries({
			queryKey: getInvoiceControllerInvoicePublicFindOneQueryKey(invoiceId ?? ""),
		});
		await queryClient.resetQueries({
			queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
		});
		await queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
		});

		// Auto-send receipt email if invoice is fully paid
		if (invoiceId) {
			try {
				// Fetch updated invoice data to check if it's fully paid
				const invoiceData = await invoiceControllerInvoicePublicFindOne(invoiceId);

				// Check if invoice is fully paid (due_amount is 0 or paid_status is "Paid")
				const isFullyPaid = invoiceData?.due_amount === 0 || invoiceData?.paid_status === "Paid";

				if (isFullyPaid) {
					const customerEmail = invoiceData?.customer?.email;
					if (customerEmail) {
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
					}
				}
			} catch (error) {
				console.error("Error sending receipt email:", error);
				// Don't show error to user as payment was successful
			}
		}

		setOpenPaymentForm(false);
		setSubmitting(false);
	};

	return (
		<>
			<Box sx={{ width: { sm: "400px" } }}>
				<Grid container justifyContent={"space-between"} padding={2}>
					<Typography
						variant="h4"
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}
					>
						<img src={Constants.customImages.ProductSymbol} alt={t("paymentForm.iconAlt")} />{" "}
						{t("paymentForm.title")}
					</Typography>

					<IconButton
						sx={{
							color: "secondary.dark",
						}}
						onClick={() => setOpenPaymentForm(false)}
					>
						<CloseIcon />
					</IconButton>
				</Grid>

				<Box sx={{ mb: 2, mt: 2 }}>
					<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
						{({ setFieldValue }) => (
							<Form>
								<Divider />
								<Grid container padding={2}>
									<Grid item xs={12}>
										<Field
											name="reference_number"
											component={TextFormField}
											label={t("paymentForm.referenceNumber")}
											type="number"
										/>
									</Grid>
									{!invoiceId && (
										<Grid item xs={12}>
											<Field
												name="invoice_id"
												label={t("paymentForm.invoice")}
												component={AutocompleteField}
												options={invoiceData?.data?.map((invoice) => ({
													value: invoice.id,
													label: invoice.invoice_number,
												}))}
												loading={invoiceData.isLoading || invoiceData.isFetching}
												isRequired={true}
												onValueChange={(value: ListDto) => {
													const invoice = invoiceData?.data?.find(
														(item) => item.id === value.value,
													);
													setFieldValue("amount", invoice?.total ?? 0);
												}}
												disabled={invoiceId ?? false}
											/>
										</Grid>
									)}
									<Grid item xs={12}>
										<Field
											name="amount"
											component={TextFormField}
											label={t("paymentForm.amount")}
											type="number"
											// disabled={true}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="paymentDetails_id"
											label={t("paymentForm.paymentDetails")}
											component={AutocompleteField}
											options={paymentData?.data?.map((payment) => ({
												value: payment.id,
												label: payment.paymentType,
											}))}
											loading={paymentData.isLoading}
											isRequired={true}
										/>
										<Box>
											<Button variant="text" startIcon={<AddIcon />} onClick={handleClickOpen}>
												{t("paymentForm.addPayment")}
											</Button>
										</Box>
									</Grid>

									<Grid item xs={12}>
										<Field
											name="notes"
											component={TextFormField}
											label={t("paymentForm.notes")}
											multiline
											rows={5}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="private_notes"
											component={TextFormField}
											label={t("paymentForm.privateNotes")}
											multiline
											rows={5}
										/>
									</Grid>

									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											{t("paymentForm.save")}
										</Button>
									</Grid>
								</Grid>
							</Form>
						)}
					</Formik>
				</Box>
			</Box>
			<PaymentDetailsDrawer open={open} handleClose={handleClose} />
		</>
	);
};

export default PaymentForm;
