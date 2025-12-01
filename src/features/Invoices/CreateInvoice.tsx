import {
	Box,
	Typography,
	Grid,
	Button,
	Divider,
	InputAdornment,
	Dialog,
	DialogContent,
	FormControl,
	FormControlLabel,
	Checkbox,
	Autocomplete,
	TextField,
	InputLabel,
} from "@mui/material";
import { Formik, Form, Field, type FormikProps, type FormikHelpers } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { DateFormField } from "@shared/components/FormFields/DateFormField";
import * as yup from "yup";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { Constants } from "@shared/constants";
import FullFeaturedCrudGrid from "../../shared/components/EditableProductListTable";
import { useAuthStore } from "@store/auth";
import { useCustomerControllerFindAll } from "@api/services/customer";
import { CheckBoxFormField } from "@shared/components/FormFields/CheckBoxFormField";
import moment from "moment";
import AddIcon from "@mui/icons-material/Add";
import PaymentDetailsDrawer from "../PaymentsDetails/PaymentDetailsDrawer";
import { useDialog } from "@shared/hooks/useDialog";
import { usePaymentdetailsControllerFindAll } from "@api/services/paymentdetails";
import {
	CreateInvoiceWithProductsRecurring,
	type OmitCreateInvoiceProductsDto,
} from "@api/services/models";
import { useEffect, useRef, useState } from "react";
import { type GridRowsProp } from "@mui/x-data-grid";
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
import { convertToReadableText, formatDateToIso } from "@shared/formatter";
import SubtotalFooter from "@shared/components/SubtotalFooter";
import { useInvoicesettingsControllerFindFirst } from "@api/services/invoicesettings";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { useTranslation } from "react-i18next";
import { translateInvoiceHtml } from "@shared/utils/invoiceTemplateTranslator";
import SaveAndSendInvoiceButton from "./components/SaveAndSendInvoiceButton";
import { useInvoiceHook } from "./invoiceHooks/useInvoiceHook";
import { LoaderService } from "@shared/services/LoaderService";
import { toast } from "react-toastify";
import { setSuppressSuccessMessages } from "@shared/services/InterceptorService";
import { useEuropeanCountryDetection } from "@shared/hooks/useEuropeanCountryDetection";

export type OmitCreateInvoiceProductsExtended = Omit<
	OmitCreateInvoiceProductsDto,
	"tax_id" | "taxes"
> & {
	id: string;
	isNew?: boolean;
	isEditPosible?: boolean;
	isEditble?: boolean;
	taxes?: string[];
};

const CreateInvoice = ({
	id,
	customerId,
	isReceipt = false,
}: {
	id?: string;
	customerId?: string;
	isReceipt?: boolean;
}) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { handlePaid } = useInvoiceHook();
	const [rows, setRows] = useState<GridRowsProp<OmitCreateInvoiceProductsExtended>>([]);
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
	const { isEuropeanCountry } = useEuropeanCountryDetection();
	const [selectedPreviewCustomer, setSelectedPreviewCustomer] = useState<{
		label: string;
		value: string;
	} | null>(null);
	const [previewCustomerError, setPreviewCustomerError] = useState<boolean>(false);
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
					taxes: product?.tax_forInvoiceProducts?.map((tax) => tax?.tax_id) ?? [],
					hsnCode_id: product?.hsnCode_id,
					isNew: true,
					isEditPosible: false,
					isEditble: true,
				})) ?? [],
			);
		}
	}, [invoiceFindOne.isSuccess || invoiceFindOne?.isRefetching]);

	// Pre-select customer when customerId is provided (only for new invoices)
	const getInitialCustomerIds = () => {
		if (id) return []; // Editing existing invoice
		if (customerId && customerData?.data) {
			const customerExists = customerData.data.some((c) => c.id === customerId);
			return customerExists ? [customerId] : [];
		}
		return [];
	};

	const initialValues = {
		currency_id: invoiceFindOne?.data?.currency_id ?? user?.currency_id ?? "",
		customer_ids: getInitialCustomerIds(),
		user_id: user?.id ?? "",
		invoice_number: invoiceFindOne?.data?.invoice_number ?? new Date().getTime().toString(),
		reference_number: invoiceFindOne?.data?.reference_number ?? "",
		date: invoiceFindOne?.data?.date ?? (id ? "" : currentDate),
		due_date: invoiceFindOne?.data?.due_date ?? "",
		is_recurring: invoiceFindOne?.data?.is_recurring ?? false,
		notes:
			invoiceFindOne?.data?.notes ??
			(id
				? ""
				: t("invoiceForm.defaultNote", {
						defaultValue: "Thank you for shopping with us. Have a Great Day.",
					})),
		paymentId: invoiceFindOne?.data?.paymentId ?? "",
		sub_total: invoiceFindOne?.data?.sub_total ?? 0,
		tax_id: invoiceFindOne?.data?.tax_id ?? "",
		total: invoiceFindOne?.data?.total ?? 0,
		paid_amount: invoiceFindOne?.data?.paid_amount ?? 0,
		due_amount: invoiceFindOne?.data?.due_amount ?? 0,
		discountPercentage: invoiceFindOne?.data?.discountPercentage ?? 0,
		recurring: invoiceFindOne?.data?.recurring ?? CreateInvoiceWithProductsRecurring.Daily,
		product:
			invoiceFindOne?.data?.product?.map((product) => ({
				...product,
				taxes: product?.product?.tax?.map((tax) => tax?.tax_id) ?? [],
			})) ?? [],
		template_id:
			invoiceFindOne?.data?.template_id ?? invoiceSettings?.data?.invoiceTemplateId ?? "",
	};

	// Set customer in form when customer data loads and customerId is provided
	useEffect(() => {
		if (!id && customerId && customerData?.data && formikRef.current) {
			const customerExists = customerData.data.some((c) => c.id === customerId);
			const currentValues = formikRef.current.values;
			if (
				customerExists &&
				"customer_ids" in currentValues &&
				Array.isArray(currentValues.customer_ids) &&
				!currentValues.customer_ids.includes(customerId)
			) {
				formikRef.current.setFieldValue("customer_ids", [customerId]);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customerData?.data, customerId, id]);

	const updateInitialValues = {
		...initialValues,
		customer_ids: undefined,
		customer_id: invoiceFindOne?.data?.customer_id ?? "",
	};

	const formikRef = useRef<FormikProps<typeof initialValues | typeof updateInitialValues>>(null);

	const schema = yup.object().shape({
		currency_id: yup.string().required(t("invoiceForm.validation.currencyRequired")),
		// customer_id: yup.string().required(t("invoiceForm.validation.customerRequired")),
		customer_ids: yup.array().of(yup.string()).min(1, t("invoiceForm.validation.customerRequired")),
		invoice_number: yup.string().required(t("invoiceForm.validation.invoiceNumberRequired")),
		reference_number: yup.string(),
		date: yup.string().required(t("invoiceForm.validation.invoiceDateRequired")),
		due_date: yup
			.string()
			.required(t("invoiceForm.validation.dueDateRequired"))
			.test({
				name: "due_date",
				message: t("invoiceForm.validation.dueDateAfterInvoice"),
				test: (value) => {
					if (formikRef.current?.values.date) {
						return moment(value).isAfter(moment(formikRef.current?.values.date));
					}
					return true;
				},
			}),
		is_recurring: yup.boolean().required(t("invoiceForm.validation.isRecurringRequired")),
		notes: yup.string(),
		paymentId: yup.string().required(t("invoiceForm.validation.paymentDetailsRequired")),
		sub_total: yup.number().required(t("invoiceForm.validation.subtotalRequired")),
		tax_id: yup.string(),
		total: yup.number().required(t("invoiceForm.validation.totalRequired")),
		discountPercentage: yup.number().min(0, t("invoiceForm.validation.discountMin")).max(100),
		recurring: yup
			.string()
			.oneOf(
				Object.values(CreateInvoiceWithProductsRecurring),
				t("invoiceForm.validation.invalidType"),
			),
		product: yup.array().of(
			yup.object({
				product_id: yup.string().required(t("invoiceForm.validation.productRequired")),
				quantity: yup.number().required(t("invoiceForm.validation.quantityRequired")),
				price: yup.number().required(t("invoiceForm.validation.priceRequired")),
				total: yup.number().required(t("invoiceForm.validation.totalRequired")),
				taxes: yup.array().of(yup.string()).nullable().optional(),
			}),
		),
		user_id: yup.string().required(t("invoiceForm.validation.userRequired")),
		template_id: yup.string().required(t("invoiceForm.validation.templateRequired")),
	});

	const updateSchema = schema.shape({
		customer_ids: yup.array().of(yup.string()).optional().nullable(),
		customer_id: yup.string().required(t("invoiceForm.validation.customerRequired")),
	});

	const handleSubmit = async (
		values: typeof initialValues | typeof updateInitialValues,
		actions: FormikHelpers<typeof initialValues | typeof updateInitialValues>,
	) => {
		if (rows?.length === 0) {
			setProductErrorText(t("invoiceForm.validation.atLeastOneProduct"));
			return;
		} else if (rows?.find((row) => row.product_id === "")) {
			setProductErrorText(t("invoiceForm.validation.fillAllProductDetails"));
			return;
		}

		// Show loading for receipt creation and suppress all messages
		if (isReceipt) {
			LoaderService.instance.showLoader();
			// Suppress all success messages during receipt creation
			setSuppressSuccessMessages(true);
		}

		try {
			const invIds = [];
			if (id) {
				invIds.push(id);
			}

			if (id) {
				await invoiceUpdate.mutateAsync({
					id,
					data: {
						...values,
						recurring: values.recurring as CreateInvoiceWithProductsRecurring,
						date: formatDateToIso(values.date),
						due_date: formatDateToIso(values.due_date),
						due_amount: isReceipt ? 0 : values.total,
						paid_amount: isReceipt ? values.total : 0,
						product: rows.map((row) => ({
							...row,
							taxes: row.taxes?.length ? row.taxes : undefined,
						})),
					},
				});
			} else {
				const createdInvoice = await createInvoice.mutateAsync({
					data: {
						...values,
						reference_number: values?.reference_number
							? values?.reference_number
							: values?.invoice_number,
						recurring: values.recurring as CreateInvoiceWithProductsRecurring,
						date: formatDateToIso(values.date),
						due_date: formatDateToIso(values.due_date),
						due_amount: isReceipt ? 0 : values.total,
						paid_amount: isReceipt ? values.total : 0,
						product: rows.map((row) => ({
							...row,
							taxes: row.taxes?.length ? row.taxes : undefined,
						})),
					},
				});
				createdInvoice?.result?.forEach((inv) => invIds.push(inv.id));
			}

			const paidPromises: any = [];
			// If this is a receipt, mark it as paid using the API endpoint
			// This will properly update the paid_status and send the receipt email
			if (isReceipt && invIds.length) {
				// Temporarily suppress success messages by storing a flag
				// The InterceptorService will show messages, but we'll show our combined message after
				invIds.forEach((iv) => paidPromises.push(handlePaid(iv)));
			}

			if (paidPromises.length) {
				await Promise.all(paidPromises);
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

			// For receipt creation, redirect and show message on receipt list page
			if (isReceipt) {
				LoaderService.instance.hideLoader();
				// Re-enable success messages
				setSuppressSuccessMessages(false);
				// Dismiss any existing toasts
				toast.dismiss();
				actions.resetForm();
				setRows([]);
				// Navigate with state to indicate we should show success message
				navigate("/receipt/receiptlist", {
					state: { showSuccessMessage: true },
				});
			} else {
				actions.resetForm();
				setRows([]);
				navigate("/invoice/invoicelist");
			}
		} catch (error) {
			if (isReceipt) {
				LoaderService.instance.hideLoader();
				// Re-enable success messages even on error
				setSuppressSuccessMessages(false);
			}
			throw error;
		}
	};

	const currencyList = useCurrencyControllerFindAll();

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
				<img src={Constants.customImages.invoiceIcon} alt={t("invoiceForm.invoiceIconAlt")} />{" "}
				{isReceipt
					? t("receipt.form.title", { defaultValue: "New Receipt" })
					: t("invoiceForm.title")}
			</Typography>
			<Divider
				sx={{
					my: 2,
				}}
			/>
			<Box sx={{ mb: 2, mt: 2 }}>
				<Formik
					initialValues={id ? updateInitialValues : initialValues}
					validationSchema={id ? updateSchema : schema}
					onSubmit={handleSubmit}
					innerRef={formikRef}
				>
					{(formik) => {
						// Effect to handle geolocation-based template selection
						useEffect(() => {
							// Only proceed if geolocation is detected
							if (isEuropeanCountry === null) return;

							if (isEuropeanCountry) {
								// If user is in Europe, find and set European template
								const europeanTemplates = invoiceTemplateFindAll?.data?.filter(
									(template) =>
										template.name?.toLowerCase().includes("european") ||
										template.name?.toLowerCase().includes("eur"),
								);
								if (europeanTemplates && europeanTemplates.length > 0) {
									const currentTemplate = invoiceTemplateFindAll?.data?.find(
										(t) => t.id === formik.values.template_id,
									);
									const isCurrentTemplateEuropean =
										currentTemplate?.name?.toLowerCase().includes("european") ||
										currentTemplate?.name?.toLowerCase().includes("eur");
									// Only set if current template is not European
									if (!isCurrentTemplateEuropean) {
										formik.setFieldValue("template_id", europeanTemplates[0].id);
									}
								}
							}
							// If user is not in Europe, show all templates (no filtering needed)
						}, [isEuropeanCountry, invoiceTemplateFindAll?.data, formik.values.template_id]);

						return (
							<Form>
								<Grid container spacing={2}>
									{id ? (
										<Grid item xs={12} sm={4}>
											<Field
												name="customer_id"
												label={t("invoiceForm.customerName")}
												component={AutocompleteField}
												options={customerData?.data?.map((customer) => ({
													value: customer.id,
													label: customer.display_name,
												}))}
												loading={customerData.isLoading}
												isRequired={true}
											/>
										</Grid>
									) : (
										<Grid item xs={12} sm={4}>
											<Field
												name="customer_ids"
												label={t("invoiceForm.customerName")}
												component={AutocompleteField}
												options={customerData?.data?.map((customer) => ({
													value: customer.id,
													label: customer.display_name,
												}))}
												loading={customerData.isLoading}
												isRequired={true}
												multiple
												limitTags={2}
											/>
										</Grid>
									)}
									<Grid item xs={12} sm={4} alignItems={"center"} display={"flex"}>
										{id ? null : (
											<FormControl>
												<FormControlLabel
													value="end"
													control={
														<Checkbox
															checked={
																formik.values.customer_ids?.length === customerData?.data?.length
															}
															onChange={(e) => {
																if (e.target.checked) {
																	formik.setFieldValue(
																		"customer_ids",
																		customerData?.data?.map((customer) => customer.id),
																	);
																} else {
																	formik.setFieldValue("customer_ids", []);
																}
															}}
														/>
													}
													label={t("invoiceForm.selectAllCustomers", {
														defaultValue: "Select all customers",
													})}
													labelPlacement="end"
												/>
											</FormControl>
										)}
										<Button
											variant="text"
											startIcon={<AddIcon />}
											onClick={() => {
												setOpenCustomerForm(true);
											}}
										>
											{t("invoiceForm.addCustomer")}
										</Button>
									</Grid>
									<Grid item xs={12} sm={4}>
										<Field
											name="currency_id"
											label={t("invoiceForm.currency")}
											component={AutocompleteField}
											loading={currencyList.isLoading || currencyList.isFetching}
											options={currencyList?.data
												?.filter(
													(currency) =>
														currency.short_code === "EUR" || currency.short_code === "INR",
												)
												?.map((currency) => ({
													value: currency.id,
													label: `${currency.short_code} - ${currency.name}`,
												}))}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} mb={3}>
										<Divider />
									</Grid>
									{id && (
										<>
											<Grid item xs={12} sm={4}>
												<Field
													name="invoice_number"
													component={TextFormField}
													label={t("invoiceForm.invoiceNumber")}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																{invoiceSettings?.data?.invoicePrefix ??
																	t("invoiceForm.invoicePrefixFallback", {
																		defaultPrefix: "INV",
																	})}
																-
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
													label={t("invoiceForm.referenceNumber")}
												/>
											</Grid>
										</>
									)}
									<Grid item xs={12} sm={4}>
										<Field
											name="date"
											component={DateFormField}
											label={
												isReceipt
													? t("receipt.form.receiptDate", { defaultValue: "Receipt Date" })
													: t("invoiceForm.invoiceDate")
											}
											// minDate={new Date()}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={4}>
										<Field
											name="due_date"
											component={DateFormField}
											label={
												isReceipt
													? t("receipt.form.receiptDueDate", { defaultValue: "Receipt Due Date" })
													: t("invoiceForm.invoiceDueDate")
											}
											minDate={moment(formik?.values.date).add(1, "days").toDate()}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={4} display={"flex"} alignItems={"center"}>
										<Field
											name="is_recurring"
											label={t("invoiceForm.isRecurring")}
											component={CheckBoxFormField}
											isRequired={true}
										/>
									</Grid>
									{formik?.values.is_recurring && (
										<Grid item xs={12} sm={4}>
											<Field
												name="recurring"
												label={t("invoiceForm.recurring")}
												component={AutocompleteField}
												options={Object.keys(CreateInvoiceWithProductsRecurring).map((key) => ({
													value: key,
													label: t(`invoiceForm.recurringTypes.${key}`, {
														defaultValue: key,
													}),
												}))}
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
											label={t("invoiceForm.notes")}
											multiline
											rows={5}
										/>
										<Field
											name="paymentId"
											label={t("invoiceForm.paymentDetails")}
											component={AutocompleteField}
											options={paymentData?.data?.map((payment) => ({
												value: payment.id,
												label:
													payment.paymentType === "UPI"
														? payment.paymentType
														: convertToReadableText(payment.paymentType),
											}))}
											loading={paymentData.isLoading}
											isRequired={true}
										/>
										<Box>
											<Button variant="text" startIcon={<AddIcon />} onClick={handleClickOpen}>
												{t("invoiceForm.addPayment")}
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
															{payment.paymentType === "IndianBanks" && (
																<>
																	<Typography variant="subtitle1">
																		{t("invoiceForm.accountNumber")}: <b>{payment.account_no}</b>
																	</Typography>
																	<Typography variant="subtitle1">
																		{t("invoiceForm.ifscCode")}: <b>{payment.ifscCode}</b>
																	</Typography>
																</>
															)}
															{payment.paymentType === "UPI" && (
																<Typography variant="subtitle1">
																	UPI: <b>{payment.upiId}</b>
																</Typography>
															)}
															{(payment.paymentType === "EuropeanBank" ||
																payment.paymentType === "Revolut" ||
																payment.paymentType === "Wise") && (
																<>
																	{(payment as any)?.bankName && (
																		<Typography variant="subtitle1">
																			{t("invoiceForm.bankName", { defaultValue: "Bank Name" })}:{" "}
																			<b>{(payment as any).bankName}</b>
																		</Typography>
																	)}
																	<Typography variant="subtitle1">
																		{t("invoiceForm.bicNumber")}: <b>{payment.bicNumber}</b>
																	</Typography>
																	<Typography variant="subtitle1">
																		{t("invoiceForm.ibanNumber")}: <b>{payment.ibanNumber}</b>
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
																	{t("invoiceForm.swiftCode")}: <b>{payment.swiftCode}</b>
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
									<Grid item xs={12} sm={3}>
										<Field
											name="template_id"
											label={
												isReceipt
													? t("receipt.form.receiptTemplate", { defaultValue: "Receipt Template" })
													: t("invoiceForm.invoiceTemplate")
											}
											component={AutocompleteField}
											options={(() => {
												// If user is in Europe, only show European templates
												if (isEuropeanCountry === true) {
													const europeanTemplates = invoiceTemplateFindAll?.data?.filter(
														(template) =>
															template.name?.toLowerCase().includes("european") ||
															template.name?.toLowerCase().includes("eur"),
													);
													// Set default to first European template if no template is selected
													if (
														europeanTemplates &&
														europeanTemplates.length > 0 &&
														!formik.values.template_id
													) {
														formik.setFieldValue("template_id", europeanTemplates[0].id);
													}
													return (
														europeanTemplates?.map((template) => ({
															value: template.id,
															label: template.name,
														})) || []
													);
												}

												// If user is not in Europe (or geolocation not detected), show all templates including European ones
												return (
													invoiceTemplateFindAll?.data?.map((template) => ({
														value: template.id,
														label: template.name,
													})) || []
												);
											})()}
											isRequired={true}
											loading={
												invoiceTemplateFindAll.isLoading || invoiceTemplateFindAll.isFetching
											}
										/>
									</Grid>
									{!id && (
										<Grid item xs={12} sm={3}>
											<FormControl fullWidth>
												<InputLabel sx={{ ml: -1.6 }} shrink>
													<Typography variant="h4" color="text.primary">
														SELECT CUSTOMER
													</Typography>
												</InputLabel>
												<Autocomplete
													value={selectedPreviewCustomer}
													onChange={(_, newValue) => {
														setSelectedPreviewCustomer(newValue);
														setPreviewCustomerError(false);
													}}
													options={
														formik?.values?.customer_ids
															? formik?.values?.customer_ids?.map((id) => {
																	const customer = customerData?.data?.find((cus) => cus.id === id);
																	return {
																		value: customer?.id ?? "",
																		label: customer?.display_name ?? "",
																	};
																})
															: (formik?.values as any)?.customer_id
																? customerData?.data
																		?.filter(
																			(cus) => cus.id === (formik?.values as any).customer_id,
																		)
																		?.map((cus) => ({ value: cus?.id, label: cus?.display_name }))
																: []
													}
													renderInput={(params) => (
														<TextField
															{...params}
															placeholder="Enter select customer"
															error={previewCustomerError}
															helperText={
																previewCustomerError
																	? t("invoiceForm.validation.customerRequired")
																	: ""
															}
														/>
													)}
												/>
											</FormControl>
										</Grid>
									)}
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
												if (!selectedPreviewCustomer && !id) {
													setPreviewCustomerError(true);
													return;
												}
												const data = await invoicePreview.mutateAsync({
													data: {
														...formik.values,
														customer_id: id
															? (formik.values as any).customer_id
															: selectedPreviewCustomer?.value,
														recurring: formik.values
															.recurring as CreateInvoiceWithProductsRecurring,
														tax_id: formik.values.tax_id === "" ? null : formik.values.tax_id,
														due_amount: formik.values.total,
														paid_amount: 0,
													},
													params: { lang: i18n.language },
												});
												// Translate the invoice HTML content before setting it
												const translatedHtml = translateInvoiceHtml(data as string, t);
												setPreviewString(translatedHtml);
												handleClickOpenInvoicePreview();
											}}
											disabled={formik.isValid === false || rows?.length === 0}
										>
											{t("invoiceForm.preview")}
										</Button>
									</Grid>
									<Grid
										item
										xs={12}
										textAlign={"center"}
										sx={{ display: "flex", gap: 2, justifyContent: "center" }}
									>
										<Button variant="contained" type="submit">
											{isReceipt
												? t("receipt.saveReceipt", { defaultValue: "Save Receipt" })
												: t("invoiceForm.saveInvoice")}
										</Button>
										{!isReceipt && (
											<SaveAndSendInvoiceButton
												formik={formik}
												rows={rows}
												invoiceId={id}
												onValidationError={setProductErrorText}
											/>
										)}
									</Grid>
								</Grid>
							</Form>
						);
					}}
				</Formik>
			</Box>

			<Dialog open={openInvoicePreview} onClose={handleClosePreview} fullWidth maxWidth="md">
				<AppDialogHeader title={t("invoiceForm.invoicePreview")} handleClose={handleClosePreview} />
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
