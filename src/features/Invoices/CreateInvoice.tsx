import {
	Box,
	Typography,
	Grid,
	Button,
	Divider,
	InputAdornment,
	Dialog,
	DialogContent,
} from "@mui/material";
import { Formik, Form, Field, FormikProps, FormikHelpers } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { DateFormField } from "@shared/components/FormFields/DateFormField";
import * as yup from "yup";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { Constants } from "@shared/constants";
import FullFeaturedCrudGrid from "../../shared/components/EditableProductListTable";
import { useAuthStore } from "@store/auth";
import { useCustomerControllerFindAll } from "@api/services/customer";
import { CheckBoxFormField } from "@shared/components/FormFields/CheckBoxFormField";
import { stringToListDto } from "@shared/models/ListDto";
import moment from "moment";
import AddIcon from "@mui/icons-material/Add";
import PaymentDetailsDrawer from "../PaymentsDetails/PaymentDetailsDrawer";
import { useDialog } from "@shared/hooks/useDialog";
import { usePaymentdetailsControllerFindAll } from "@api/services/paymentdetails";
import { CreateInvoiceWithProductsRecurring } from "@api/services/models";
import { useEffect, useRef, useState } from "react";
import { GridRowsProp } from "@mui/x-data-grid";
import {
	getInvoiceControllerFindAllQueryKey,
	getInvoiceControllerFindDueInvoicesQueryKey,
	getInvoiceControllerFindOneQueryKey,
	getInvoiceControllerFindPaidInvoicesQueryKey,
	useInvoiceControllerCreate,
	useInvoiceControllerFindOne,
	useInvoiceControllerUpdate,
	useInvoiceControllerInvoicePreviewFromBody,
	getInvoiceControllerTestQueryKey,
	getInvoiceControllerInvoiceCountQueryKey,
	getInvoiceControllerTotalDueQueryKey,
	getInvoiceControllerOutstandingReceivableQueryKey,
	getInvoiceControllerFindDueTodayQueryKey,
	getInvoiceControllerFindDueMonthQueryKey,
} from "@api/services/invoice";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import Loader from "@shared/components/Loader";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import { useInvoicetemplateControllerFindAll } from "@api/services/invoicetemplate";
import { formatDateToIso } from "@shared/formatter";
import SubtotalFooter from "@shared/components/SubtotalFooter";
import { useInvoicesettingsControllerFindFirst } from "@api/services/invoicesettings";

const CreateInvoice = ({ id }: { id?: string }) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [rows, setRows] = useState<GridRowsProp>([]);
	const [productErrorText, setProductErrorText] = useState<string | undefined>(undefined);
	const { open, handleClickOpen, handleClose } = useDialog();
	const {
		open: openInvoicePreview,
		handleClickOpen: handleClickOpenInvoicePreview,
		handleClose: handleCloseInvoicePreview,
	} = useDialog();
	const { user } = useAuthStore();
	const customerData = useCustomerControllerFindAll();
	const paymentData = usePaymentdetailsControllerFindAll();
	const createInvoice = useInvoiceControllerCreate();
	const { setOpenCustomerForm } = useCreateCustomerStore.getState();
	const [previewString, setPreviewString] = useState<string | undefined>(undefined);
	const invoiceSettings = useInvoicesettingsControllerFindFirst();
	const invoiceFindOne = useInvoiceControllerFindOne(id ?? "", {
		query: {
			enabled: id !== undefined,
		},
	});
	const invoiceTemplateFindAll = useInvoicetemplateControllerFindAll();

	const invoiceUpdate = useInvoiceControllerUpdate();
	const invoicePreview = useInvoiceControllerInvoicePreviewFromBody();
	const currentDate = moment().format("YYYY-MM-DD");
	const handleClosePreview = () => {
		setPreviewString(undefined);
		handleCloseInvoicePreview();
	};

	useEffect(() => {
		if (invoiceFindOne.isSuccess) {
			setRows(
				invoiceFindOne?.data?.product?.map((product) => ({
					id: product?.id,
					product_id: product?.product_id,
					quantity: product?.quantity,
					price: product?.price,
					total: product?.total,
					tax_id: product?.tax_id,
					hsnCode_id: product?.hsnCode_id,
					isNew: true,
					isEditPosible: false,
					isEditble: true,
				})) ?? [],
			);
		}
	}, [invoiceFindOne.isSuccess || invoiceFindOne?.isRefetching]);

	const initialValues = {
		customer_id: invoiceFindOne?.data?.customer_id ?? "",
		user_id: user?.id ?? "",
		invoice_number: invoiceFindOne?.data?.invoice_number ?? "",
		reference_number: invoiceFindOne?.data?.reference_number ?? "",
		date: invoiceFindOne?.data?.date ?? "",
		due_date: invoiceFindOne?.data?.due_date ?? "",
		is_recurring: invoiceFindOne?.data?.is_recurring ?? false,
		notes: invoiceFindOne?.data?.notes ?? "",
		paymentId: invoiceFindOne?.data?.paymentId ?? "",
		sub_total: invoiceFindOne?.data?.sub_total ?? 0,
		tax_id: invoiceFindOne?.data?.tax_id ?? "",
		total: invoiceFindOne?.data?.total ?? 0,
		paid_amount: invoiceFindOne?.data?.paid_amount ?? 0,
		due_amount: invoiceFindOne?.data?.due_amount ?? 0,
		discountPercentage: invoiceFindOne?.data?.discountPercentage ?? 0,
		recurring: invoiceFindOne?.data?.recurring ?? CreateInvoiceWithProductsRecurring.Daily,
		product: invoiceFindOne?.data?.product ?? [],
		template_id:
			invoiceFindOne?.data?.template_id ?? invoiceSettings?.data?.invoiceTemplateId ?? "",
	};

	const formikRef = useRef<FormikProps<typeof initialValues>>(null);

	const schema = yup.object().shape({
		customer_id: yup.string().required("Customer is required"),
		invoice_number: yup.string().required("Invoice number is required"),
		reference_number: yup.string(),
		date: yup.string().required("Invoice date is required"),
		due_date: yup
			.string()
			.required("Due date is required")
			.test({
				name: "due_date",
				message: "Due date should be greater than invoice date",
				test: (value) => {
					if (formikRef.current?.values.date) {
						return moment(value).isAfter(moment(formikRef.current?.values.date));
					}
					return true;
				},
			}),
		is_recurring: yup.boolean().required("Is recurring is required"),
		notes: yup.string(),
		paymentId: yup.string().required("Payment details is required"),
		sub_total: yup.number().required("Subtotal is required"),
		tax_id: yup.string(),
		total: yup.number().required("Total is required"),
		discountPercentage: yup.number().min(0).max(100),
		recurring: yup
			.string()
			.oneOf(Object.values(CreateInvoiceWithProductsRecurring), "Invalid Type"),
		product: yup.array().of(
			yup.object({
				product_id: yup.string().required("Product is required"),
				quantity: yup.number().required("Quantity is required"),
				price: yup.number().required("Price is required"),
				total: yup.number().required("Total is required"),
			}),
		),
		user_id: yup.string().required("User is required"),
		template_id: yup.string().required("Template is required"),
	});

	const handleSubmit = async (
		values: typeof initialValues,
		actions: FormikHelpers<typeof initialValues>,
	) => {
		if (rows?.length === 0) {
			setProductErrorText("At least one product is required");
			return;
		} else if (rows?.find((row) => row.product_id === "")) {
			setProductErrorText("Fullfill all the product details");
			return;
		}

		if (id) {
			await invoiceUpdate.mutateAsync({
				id,
				data: {
					...values,
					recurring: values.recurring as CreateInvoiceWithProductsRecurring,
					date: formatDateToIso(values.date),
					due_date: formatDateToIso(values.due_date),
					due_amount: values.total,
					paid_amount: 0,
				},
			});
		} else {
			await createInvoice.mutateAsync({
				data: {
					...values,
					reference_number: values?.reference_number
						? values?.reference_number
						: values?.invoice_number,
					recurring: values.recurring as CreateInvoiceWithProductsRecurring,
					date: formatDateToIso(values.date),
					due_date: formatDateToIso(values.due_date),
					due_amount: values.total,
					paid_amount: 0,
				},
			});
		}
		await queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindOneQueryKey(id ?? ""),
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
			queryKey: getInvoiceControllerTestQueryKey(id ?? ""),
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
		actions.resetForm();
		setRows([]);
		navigate("/invoice/invoicelist");
	};

	if (
		invoiceFindOne.isLoading ||
		invoiceFindOne?.isRefetching ||
		invoiceFindOne?.isFetching ||
		invoiceSettings?.isLoading
	)
		return <Loader />;

	return (
		<>
			<Typography
				variant="h3"
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 2,
				}}
				textTransform={"capitalize"}
			>
				<img src={Constants.customImages.invoiceIcon} alt="Invoice Icon" /> New Invoices
			</Typography>
			<Divider
				sx={{
					my: 2,
				}}
			/>
			<Box sx={{ mb: 2, mt: 2 }}>
				<Formik
					initialValues={initialValues}
					validationSchema={schema}
					onSubmit={handleSubmit}
					innerRef={formikRef}
				>
					{(formik) => {
						return (
							<Form>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={4}>
										<Field
											name="customer_id"
											label="Customer Name"
											component={AutocompleteField}
											options={customerData?.data?.map((customer) => ({
												value: customer.id,
												label: customer.display_name,
											}))}
											loading={customerData.isLoading}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={4} alignItems={"center"} display={"flex"}>
										<Button
											variant="text"
											startIcon={<AddIcon />}
											onClick={() => {
												setOpenCustomerForm(true);
											}}
										>
											Add Customer
										</Button>
									</Grid>
									<Grid item xs={12} mb={3}>
										<Divider />
									</Grid>
									<Grid item xs={12} sm={4}>
										<Field
											name="invoice_number"
											component={TextFormField}
											label="Invoice Number"
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														{invoiceSettings?.data?.invoicePrefix ?? "INV"} -
													</InputAdornment>
												),
											}}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={4}>
										<Field
											name="reference_number"
											component={TextFormField}
											label="Reference Number"
										/>
									</Grid>
									<Grid item xs={12} sm={4}>
										<Field
											name="date"
											component={DateFormField}
											label="Invoice Date"
											// minDate={new Date()}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={4}>
										<Field
											name="due_date"
											component={DateFormField}
											label="Invoice Due Date"
											minDate={moment(formik?.values.date).add(1, "days").toDate()}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={4} display={"flex"} alignItems={"center"}>
										<Field
											name="is_recurring"
											label="Is Recurring"
											component={CheckBoxFormField}
											isRequired={true}
										/>
									</Grid>
									{formik?.values.is_recurring && (
										<Grid item xs={12} sm={4}>
											<Field
												name="recurring"
												label="Recurring"
												component={AutocompleteField}
												options={Object.keys(CreateInvoiceWithProductsRecurring).map(
													stringToListDto,
												)}
											/>
										</Grid>
									)}
									<Grid item xs={12} mb={3}>
										<Divider />
									</Grid>

									<Grid item xs={12} sx={{ width: { xs: "90vw", sm: "auto" } }}>
										<FullFeaturedCrudGrid
											rows={rows}
											setRows={setRows}
											setErrorText={setProductErrorText}
											errorText={productErrorText}
											formik={formik}
										/>
									</Grid>

									<Grid item xs={12} mb={3}>
										<Divider />
									</Grid>
									<Grid
										item
										xs={12}
										sm={6}
										sx={{
											pr: {
												sm: "20%",
												xs: 0,
											},
										}}
									>
										<Field
											name="notes"
											component={TextFormField}
											label="Notes"
											multiline
											rows={5}
										/>
										<Field
											name="paymentId"
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
										{formik?.values.paymentId ? (
											<Box
												sx={{
													bgcolor: "custom.lightBlue",
													padding: 2,
													borderRadius: 1,
													mb: 1,
												}}
											>
												{paymentData?.data
													?.filter((payment) => payment.id === formik?.values.paymentId)
													.map((payment) => (
														<Box key={payment.id}>
															<Typography
																variant="h5"
																sx={{
																	textTransform: "uppercase",
																}}
															>
																{payment.paymentType}
															</Typography>
															{payment.paymentType === "IndianBank" && (
																<>
																	<Typography variant="subtitle1">
																		Account Number: <b>{payment.account_no}</b>
																	</Typography>
																	<Typography variant="subtitle1">
																		IFSC Code: <b>{payment.ifscCode}</b>
																	</Typography>
																</>
															)}
															{payment.paymentType === "UPI" && (
																<Typography variant="subtitle1">
																	UPI: <b>{payment.upiId}</b>
																</Typography>
															)}
															{payment.paymentType === "EuropeanBank" && (
																<>
																	<Typography variant="subtitle1">
																		BIC Number: <b>{payment.bicNumber}</b>
																	</Typography>
																	<Typography variant="subtitle1">
																		IBAN Number: <b>{payment.ibanNumber}</b>
																	</Typography>
																</>
															)}
															{payment.paymentType === "Mollie" && (
																<Typography variant="subtitle1">
																	Mollie ID: <b>{payment.mollieId}</b>
																</Typography>
															)}
															{payment.paymentType === "Paypal" && (
																<Typography variant="subtitle1">
																	Paypal ID: <b>{payment.paypalId}</b>
																</Typography>
															)}
															{payment.paymentType === "Razorpay" && (
																<Typography variant="subtitle1">
																	Razorpay ID: <b>{payment.razorpayId}</b>
																</Typography>
															)}
															{payment.paymentType === "Stripe" && (
																<Typography variant="subtitle1">
																	Stripe ID: <b>{payment.stripeId}</b>
																</Typography>
															)}
															{payment.paymentType === "SwiftCode" && (
																<Typography variant="subtitle1">
																	Swift Code: <b>{payment.swiftCode}</b>
																</Typography>
															)}
														</Box>
													))}
											</Box>
										) : (
											<></>
										)}
									</Grid>
									<Grid item xs={12} sm={6}>
										<SubtotalFooter formik={formik} />
									</Grid>
									<Grid item xs={12} sm={3.5}>
										<Field
											name="template_id"
											label="Invoice Template"
											component={AutocompleteField}
											options={invoiceTemplateFindAll?.data?.map((template) => ({
												value: template.id,
												label: template.name,
											}))}
											isRequired={true}
											loading={
												invoiceTemplateFindAll.isLoading || invoiceTemplateFindAll.isFetching
											}
										/>
									</Grid>
									<Grid
										item
										xs={12}
										sm={6}
										sx={{
											display: {
												xs: "none",
												sm: "flex",
											},
											alignItems: "center",
										}}
									>
										<Button
											variant="outlined"
											onClick={async () => {
												const data = await invoicePreview.mutateAsync({
													data: {
														...formik.values,
														recurring: formik.values
															.recurring as CreateInvoiceWithProductsRecurring,
														tax_id: formik.values.tax_id === "" ? null : formik.values.tax_id,
														due_amount: formik.values.total,
														paid_amount: 0,
													},
												});
												setPreviewString(data as string);
												handleClickOpenInvoicePreview();
											}}
											disabled={formik.isValid === false || rows?.length === 0}
										>
											Preview
										</Button>
									</Grid>
									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											Save Invoice
										</Button>
									</Grid>
								</Grid>
							</Form>
						);
					}}
				</Formik>
			</Box>

			<Dialog open={openInvoicePreview} onClose={handleClosePreview} fullWidth maxWidth="md">
				<AppDialogHeader title="Invoice Preview" handleClose={handleClosePreview} />
				<DialogContent>
					<Box
						component="iframe"
						srcDoc={previewString}
						sx={{
							width: {
								xs: "1100px",
								md: "100%",
							},
							height: "75vh",
							overflowX: { xs: "scroll", sm: "visible" },
						}}
					></Box>
				</DialogContent>
			</Dialog>

			<PaymentDetailsDrawer open={open} handleClose={handleClose} />
		</>
	);
};

export default CreateInvoice;
