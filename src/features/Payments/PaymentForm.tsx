import {
	getInvoiceControllerFindDueInvoicesQueryKey,
	getInvoiceControllerFindPaidInvoicesQueryKey,
	getInvoiceControllerInvoicePublicFindOneQueryKey,
	getInvoiceControllerTestQueryKey,
	useInvoiceControllerFindDueInvoices,
} from "@api/services/invoice";
import { CreatePaymentsDto } from "@api/services/models";
import { useAuthStore } from "@store/auth";
import * as Yup from "yup";
import { useCreatePaymentStore } from "@store/createPaymentStore";
import { Box, Button, Divider, Grid, IconButton, Typography } from "@mui/material";
import { Constants } from "@shared/constants";
import { Formik, Form, Field, FormikHelpers } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { ListDto } from "@shared/models/ListDto";
import { usePaymentdetailsControllerFindAll } from "@api/services/paymentdetails";
import { useDialog } from "@shared/hooks/useDialog";
import PaymentDetailsDrawer from "@features/PaymentsDetails/PaymentDetailsDrawer";
import AddIcon from "@mui/icons-material/Add";
import {
	getPaymentsControllerFindAllQueryKey,
	usePaymentsControllerCreate,
} from "@api/services/payments";
import { useQueryClient } from "@tanstack/react-query";

const PaymentForm = () => {
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

	const schema: Yup.Schema<CreatePaymentsDto> = Yup.object().shape({
		amount: Yup.number().required("Amount is required"),
		invoice_id: Yup.string().required("Invoice is required"),
		paymentDetails_id: Yup.string().required("Payment Details is required"),
		user_id: Yup.string().required("User is required"),
		notes: Yup.string().nullable(),
		paymentDate: Yup.string().required("Payment Date is required"),
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
		queryClient.refetchQueries({
			queryKey: getPaymentsControllerFindAllQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerTestQueryKey(invoiceId ?? ""),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerInvoicePublicFindOneQueryKey(invoiceId ?? ""),
		});
		queryClient.resetQueries({
			queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
		});
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
						<img src={Constants.customImages.ProductSymbol} alt="Invoice Icon" /> New Payment
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
											label="Reference Number"
											type="number"
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="invoice_id"
											label="Invoice"
											component={AutocompleteField}
											options={invoiceData?.data?.map((invoice) => ({
												value: invoice.id,
												label: invoice.invoice_number,
											}))}
											loading={invoiceData.isLoading || invoiceData.isFetching}
											isRequired={true}
											onValueChange={(value: ListDto) => {
												const invoice = invoiceData?.data?.find((item) => item.id === value.value);
												setFieldValue("amount", invoice?.total ?? 0);
											}}
											disabled={invoiceId ?? false}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="amount"
											component={TextFormField}
											label="Amount"
											type="number"
											disabled={true}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="paymentDetails_id"
											label="Payment Details"
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
												Add Payment
											</Button>
										</Box>
									</Grid>

									<Grid item xs={12}>
										<Field
											name="notes"
											component={TextFormField}
											label="Notes"
											multiline
											rows={5}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="private_notes"
											component={TextFormField}
											label="Private Notes"
											multiline
											rows={5}
										/>
									</Grid>

									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											Save
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
