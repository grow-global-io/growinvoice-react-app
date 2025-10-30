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
import FullFeaturedCrudGrid from "@shared/components/EditableProductListTable";
import { GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import AddIcon from "@mui/icons-material/Add";
import { useCustomerControllerFindAll } from "@api/services/customer";
import {
	getQuotationControllerFindAllQueryKey,
	getQuotationControllerFindOneQueryKey,
	getQuotationControllerQuotationPublicFindOneQueryKey,
	useQuotationControllerCreate,
	useQuotationControllerFindOne,
	useQuotationControllerQuotationPreviewFromBody,
	useQuotationControllerUpdate,
} from "@api/services/quotation";
import { useAuthStore } from "@store/auth";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Loader from "@shared/components/Loader";
import SubtotalFooter from "@shared/components/SubtotalFooter";
import { formatToIso } from "@shared/formatter";
import { useNavigate } from "react-router-dom";
import { useQuotationtemplateControllerFindAll } from "@api/services/quotationtemplate";
import { useQuotationsettingsControllerFindFirst } from "@api/services/quotationsettings";
import { useDialog } from "@shared/hooks/useDialog";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import { OmitCreateInvoiceProductsExtended } from "@features/Invoices/CreateInvoice";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { useTranslation } from "react-i18next";

const CreateQuotation = ({ id }: { id?: string }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [errorText, setErrorText] = useState<string | undefined>(undefined);
	const queryClient = useQueryClient();
	const { setOpenCustomerForm } = useCreateCustomerStore.getState();
	const [previewString, setPreviewString] = useState<string | undefined>(undefined);
	const customerData = useCustomerControllerFindAll();
	const [rows, setRows] = useState<GridRowsProp<OmitCreateInvoiceProductsExtended>>([]);
	const { user } = useAuthStore();
	const createQuotation = useQuotationControllerCreate();
	const quotationTemplate = useQuotationtemplateControllerFindAll();
	const quotationSettings = useQuotationsettingsControllerFindFirst();
	const quotationPreview = useQuotationControllerQuotationPreviewFromBody();
	const quotationFindOne = useQuotationControllerFindOne(id ?? "", {
		query: {
			enabled: id !== undefined,
		},
	});

	const {
		open: openQuotationPreview,
		handleClickOpen: handleClickOpenQuotationPreview,
		handleClose: handleCloseQuotationPreview,
	} = useDialog();

	const handleClosePreview = () => {
		setPreviewString(undefined);
		handleCloseQuotationPreview();
	};

	const quotationUpdate = useQuotationControllerUpdate();

	useEffect(() => {
		if (quotationFindOne.isSuccess) {
			setRows(
				quotationFindOne?.data?.product?.map((product) => ({
					id: product.id,
					product_id: product.product_id,
					quantity: product.quantity,
					price: product.price,
					taxes: product.tax_forQuotationProducts?.map((tax) => tax?.tax_id) ?? [],
					hsnCode_id: product.hsnCode_id,
					total: product.total,
					isNew: true,
					isEditPosible: false,
					isEditble: true,
				})) ?? [],
			);
		}
	}, [quotationFindOne.isSuccess]);
	const initialValues = {
		user_id: user?.id ?? "",
		customer_id: quotationFindOne?.data?.customer_id ?? "",
		currency_id: quotationFindOne?.data?.currency_id ?? "",
		quatation_number: quotationFindOne?.data?.quatation_number ?? new Date().getTime().toString(),
		reference_number: quotationFindOne?.data?.reference_number ?? "",
		date: quotationFindOne?.data?.date ?? "",
		expiry_at: quotationFindOne?.data?.expiry_at ?? "",
		notes: quotationFindOne?.data?.notes ?? "",
		private_notes: quotationFindOne?.data?.private_notes ?? "",
		sub_total: quotationFindOne?.data?.sub_total ?? 0,
		tax_id: quotationFindOne?.data?.tax_id ?? "",
		total: quotationFindOne?.data?.total ?? 0,
		discountPercentage: quotationFindOne?.data?.discountPercentage ?? 0,
		template_id: quotationFindOne?.data?.template_id ?? "",
		product:
			quotationFindOne?.data?.product?.map((product) => ({
				...product,
				taxes: product.tax_forQuotationProducts?.map((tax) => tax?.tax_id) ?? [],
			})) ?? [],
	};

	const formikRef = useRef<FormikProps<typeof initialValues>>(null);

	const schema = yup.object().shape({
		customer_id: yup.string().required(t("quotationForm.validation.customerRequired")),
		currency_id: yup.string().required(t("quotationForm.validation.currencyRequired")),
		user_id: yup.string().required(t("quotationForm.validation.userRequired")),
		quatation_number: yup.string().required(t("quotationForm.validation.numberRequired")),
		reference_number: yup.string(),
		date: yup.string().required(t("quotationForm.validation.dateRequired")),
		expiry_at: yup
			.string()
			.required(t("quotationForm.validation.expiryRequired"))
			.test({
				name: "expiry_at",
				message: t("quotationForm.validation.expiryAfterDate"),
				test: (value) => {
					if (formikRef.current?.values.date) {
						return moment(value).isAfter(moment(formikRef.current?.values.date));
					}
					return true;
				},
			}),
		notes: yup.string(),
		private_notes: yup.string(),
		sub_total: yup.number().required(t("quotationForm.validation.subtotalRequired")),
		tax_id: yup.string(),
		total: yup.number().required(t("quotationForm.validation.totalRequired")),
		discountPercentage: yup.number(),
		quotation: yup
			.array()
			.of(
				yup.object({
					product_id: yup.string().required(t("quotationForm.validation.productRequired")),
					quantity: yup.number().required(t("quotationForm.validation.quantityRequired")),
					price: yup.number().required(t("quotationForm.validation.priceRequired")),
					total: yup.number().required(t("quotationForm.validation.totalRequired")),
					taxes: yup.array().of(yup.string()).nullable().optional(),
				}),
			)
			.min(1, t("quotationForm.validation.atLeastOneProduct")),
		template_id: yup.string().required(t("quotationForm.validation.templateRequired")),
	});

	const handleSubmit = async (
		values: typeof initialValues,
		actions: FormikHelpers<typeof initialValues>,
	) => {
		if (id) {
			await quotationUpdate.mutateAsync({
				id,
				data: {
					...values,
					date: formatToIso(values.date),
					expiry_at: formatToIso(values.expiry_at),
					product: rows.map((row) => ({
						...row,
						taxes: row.taxes?.length ? row.taxes : undefined, // Assuming taxes is an array of objects with a value property
					})),
				},
			});
		} else {
			await createQuotation.mutateAsync({
				data: {
					...values,
					date: formatToIso(values.date),
					expiry_at: formatToIso(values.expiry_at),
					product: rows.map((row) => ({
						...row,
						taxes: row.taxes?.length ? row.taxes : undefined, // Assuming taxes is an array of objects with a value property
					})),
				},
			});
		}

		await queryClient.refetchQueries({
			queryKey: getQuotationControllerFindOneQueryKey(id ?? ""),
		});
		await queryClient.refetchQueries({
			queryKey: getQuotationControllerQuotationPublicFindOneQueryKey(id ?? ""),
		});
		await queryClient.refetchQueries({
			queryKey: getQuotationControllerFindAllQueryKey(),
		});
		actions.resetForm();
		setRows([]);
		navigate("/quotation/quotationlist");
	};

	const currencyList = useCurrencyControllerFindAll();

	if (
		quotationFindOne.isLoading ||
		quotationFindOne.isFetching ||
		quotationFindOne?.isRefetching ||
		quotationSettings.isLoading
	) {
		return <Loader />;
	}

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
				<img src={Constants.customImages.QuotationIcon} alt={t("quotationForm.iconAlt")} />{" "}
				{t("quotationForm.title")}
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
											label={t("quotationForm.customerName")}
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
											{t("quotationForm.addCustomer")}
										</Button>
									</Grid>
									<Grid item xs={12} sm={4}>
										<Field
											name="currency_id"
											label={t("quotationForm.currency")}
											component={AutocompleteField}
											loading={currencyList.isLoading || currencyList.isFetching}
											options={currencyList?.data?.map((currency) => ({
												value: currency.id,
												label: `${currency.short_code} - ${currency.name}`,
											}))}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} mb={3}>
										<Divider />
									</Grid>
									<Grid item xs={12} sm={6} lg={4}>
										<Field
											name="quatation_number"
											component={TextFormField}
											label={t("quotationForm.number")}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														{quotationSettings?.data?.quotationPrefix ??
															Constants?.quotationDefaultPrefix}{" "}
														-
													</InputAdornment>
												),
											}}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={6} lg={4}>
										<Field
											name="reference_number"
											component={TextFormField}
											label={t("quotationForm.referenceNumber")}
										/>
									</Grid>
									<Grid item xs={12} sm={6} lg={4}>
										<Field
											name="date"
											component={DateFormField}
											label={t("quotationForm.date")}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={6} lg={4}>
										<Field
											name="expiry_at"
											component={DateFormField}
											label={t("quotationForm.expiryDate")}
											minDate={moment(formik?.values.date).add(1, "days").toDate()}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} mb={3}>
										<Divider />
									</Grid>
									<Grid item xs={12} sx={{ width: { xs: "90vw", sm: "auto" } }}>
										<FullFeaturedCrudGrid
											rows={rows}
											setRows={setRows}
											errorText={errorText}
											setErrorText={setErrorText}
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
												lg: "20%",
												xs: 0,
											},
										}}
									>
										<Field
											name="notes"
											component={TextFormField}
											label={t("quotationForm.notes")}
											multiline
											rows={5}
										/>
										<Field
											name="private_notes"
											component={TextFormField}
											label={t("quotationForm.privateNotes")}
											multiline
											rows={5}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<SubtotalFooter formik={formik} />
									</Grid>
									<Grid item xs={12} sm={3.5}>
										<Field
											name="template_id"
											label={t("quotationForm.template")}
											component={AutocompleteField}
											options={quotationTemplate?.data?.map((template) => ({
												value: template.id,
												label: template.name,
											}))}
											loading={quotationTemplate.isLoading}
											isRequired={true}
										/>
									</Grid>
									<Grid
										item
										xs={12}
										sm={6}
										display="flex"
										alignItems="center"
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
												const data = await quotationPreview.mutateAsync({
													data: {
														...formik.values,
														tax_id: formik.values.tax_id === "" ? null : formik.values.tax_id,
													},
												});
												setPreviewString(data as string);
												handleClickOpenQuotationPreview();
											}}
											disabled={formik.isValid === false || rows?.length === 0}
										>
											{t("quotationForm.preview")}
										</Button>
									</Grid>
									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											{t("quotationForm.save")}
										</Button>
									</Grid>
								</Grid>
							</Form>
						);
					}}
				</Formik>
			</Box>
			<Dialog open={openQuotationPreview} onClose={handleClosePreview} fullWidth maxWidth="md">
				<AppDialogHeader title={t("quotationForm.previewTitle")} handleClose={handleClosePreview} />
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
		</>
	);
};

export default CreateQuotation;
