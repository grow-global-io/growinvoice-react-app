import { Box, Grid, Typography, IconButton, Button, Divider } from "@mui/material";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { Constants } from "@shared/constants";
import { Formik, Field, Form, type FormikHelpers, FieldArray } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import * as yup from "yup";
import { useDialog } from "@shared/hooks/useDialog";
import CreateProductUnit from "../ProductUnit/CreateProductUnit";
import CreateHSNCode from "../HSNCode/CreateHSNCode";
import CreateTaxes from "../ProductTaxes/CreateTaxes";
import { useCreateProductStore } from "@store/createProductStore";
import { type CreateProductWithTaxDto, CreateProductWithTaxDtoType } from "@api/services/models";
import { useAuthStore } from "@store/auth";
import { type ListDto } from "@shared/models/ListDto";
import {
	getProductControllerFindAllQueryKey,
	useProductControllerCreate,
	useProductControllerUpdate,
} from "@api/services/product";
import { useProductunitControllerFindAll } from "@api/services/productunit";
import { useHsncodeControllerFindAll } from "@api/services/hsncode";
import { useTaxcodeControllerFindAll } from "@api/services/tax-code";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { AlertService } from "@shared/services/AlertService";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import { CheckBoxFormField } from "@shared/components/FormFields/CheckBoxFormField";
import MultipleFileUploadFormField from "@shared/components/FormFields/MultipleFileUploadFormField";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

const schema = yup.object({
	type: yup
		.string()
		.required(() => i18n.t("productForm.validation.typeRequired"))
		.oneOf(Object.values(CreateProductWithTaxDtoType), () =>
			i18n.t("productForm.validation.invalidType"),
		),
	name: yup.string().required(() => i18n.t("productForm.validation.nameRequired")),
	unit_id: yup.string().required(() => i18n.t("productForm.validation.unitRequired")),
	hsnCode_id: yup.string(),
	images: yup
		.array()
		.of(yup.string().url(() => i18n.t("productForm.validation.imageUrl")))
		.test(
			"includeStore",
			() => i18n.t("productForm.validation.imageRequiredForStore"),
			function (value) {
				const { includeStore } = this.parent;
				if (includeStore && (!value || value.length === 0)) {
					return this.createError({
						message: i18n.t("productForm.validation.imageRequiredForStore"),
					});
				}
				return true;
			},
		)
		.required(() => i18n.t("productForm.validation.imagesRequired"))
		.default([]),

	includeStore: yup.boolean().optional(),
	// currency_id: yup.string().required("Currency is required"),
	// price: yup
	// 	.number()
	// 	.typeError("Price must be a number")
	// 	.required("Price is required")
	// 	.min(0.0000000001, "Price should be greater than 0"),
	description: yup.string().nullable(),
	user_id: yup.string().required(() => i18n.t("productForm.validation.userIdRequired")),
	tax: yup
		.array()
		.of(yup.string().required(() => i18n.t("productForm.validation.taxRequired")))
		.nullable()
		.default([]),
	priceBook: yup
		.array()
		.of(
			yup.object({
				currency_id: yup.string().required(() => i18n.t("productForm.validation.currencyRequired")),
				price: yup
					.number()
					.typeError(() => i18n.t("productForm.validation.priceNumber"))
					.required(() => i18n.t("productForm.validation.priceRequired"))
					.min(0.0000000001, () => i18n.t("productForm.validation.priceMin")),
			}),
		)
		.required(() => i18n.t("productForm.validation.priceBookRequired"))
		.min(1, () => i18n.t("productForm.validation.priceBookAtLeastOne")),
});

const ProductForm = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { user, isGetStartedDialogOpen } = useAuthStore();
	const createProduct = useProductControllerCreate();
	const { setOpenProductForm, editValues } = useCreateProductStore.getState();
	const productUnit = useProductunitControllerFindAll();
	const hsnCodes = useHsncodeControllerFindAll();
	const taxCodes = useTaxcodeControllerFindAll();
	const currencyList = useCurrencyControllerFindAll();
	const updateProduct = useProductControllerUpdate();
	const isIndia = user?.company?.[0]?.country?.name === "India";

	const handleSubmit = async (
		values: CreateProductWithTaxDto,
		action: FormikHelpers<CreateProductWithTaxDto>,
	) => {
		if (isGetStartedDialogOpen()) {
			AlertService.instance.errorMessage(
				"Please complete the Get Started process before creating a product.",
			);
			return;
		}
		action.setSubmitting(true);
		const transformedValues = {
			...values,
			hsnCode_id: values.hsnCode_id === "" ? null : values.hsnCode_id,
		};
		if (editValues) {
			await updateProduct.mutateAsync({
				id: editValues.id,
				data: transformedValues,
			});
		} else {
			await createProduct.mutateAsync({
				data: transformedValues,
			});
		}
		action.resetForm();
		queryClient.invalidateQueries({
			queryKey: getProductControllerFindAllQueryKey(),
		});
		setOpenProductForm(false);
		action.setSubmitting(false);
	};

	const initialValues: CreateProductWithTaxDto = {
		type: editValues?.type ?? "Goods",
		name: editValues?.name ?? "",
		unit_id: editValues?.unit_id ?? "",
		hsnCode_id: editValues?.hsnCode_id ?? "",
		tax: editValues?.tax?.map((tax) => tax.tax_id) ?? [],
		description: editValues?.description ?? "",
		user_id: user?.id ?? "",
		priceBook:
			editValues?.priceBook?.map((price) => ({
				currency_id: price.currency_id,
				price: price.price,
			})) ?? [],
		images: editValues?.images ?? [],
		includeStore: editValues?.includeStore ?? false,
	};

	const {
		handleClickOpen: handleProductUnitOpen,
		handleClose: handleProductUnitClose,
		open: openProductUnitForm,
	} = useDialog();

	const {
		handleClickOpen: handleHsnCodeOpen,
		handleClose: handleHsnCodeClose,
		open: openHsnCodeForm,
	} = useDialog();

	const {
		handleClickOpen: handleTaxesOpen,
		handleClose: handleTaxesClose,
		open: openTaxesForm,
	} = useDialog();

	return (
		<Box sx={{ width: { sm: "400px", md: "600px" } }}>
			<Grid container justifyContent={"space-between"} padding={2}>
				<Typography
					variant="h4"
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<img src={Constants.customImages.ProductSymbol} alt={t("productForm.iconAlt")} />{" "}
					{t("productForm.title")}
				</Typography>

				<IconButton
					sx={{
						color: "secondary.dark",
					}}
					onClick={() => setOpenProductForm(false)}
				>
					<CloseIcon />
				</IconButton>
			</Grid>

			<Box sx={{ mb: 2, mt: 2 }}>
				<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
					{({ values, setFieldValue, errors }) => {
						console.log("errors", errors);
						return (
							<Form>
								<Divider />
								<Grid container my={1} padding={2}>
									<Grid item xs={12}>
										<Field
											name="type"
											label={t("productForm.type")}
											component={AutocompleteField}
											options={Object.values(CreateProductWithTaxDtoType).map((value) => ({
												value,
												label:
													value === CreateProductWithTaxDtoType.Goods
														? t("product.type.goods", { defaultValue: "Goods" })
														: t("product.type.services", { defaultValue: "Services" }),
											}))}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="name"
											component={TextFormField}
											label={t("productForm.productName")}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="includeStore"
											label={t("productForm.includeStore")}
											component={CheckBoxFormField}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="images"
											label={t("productForm.productImages")}
											component={MultipleFileUploadFormField}
											accept="image/*"
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="unit_id"
											label={t("productForm.unit")}
											loading={productUnit.isLoading || productUnit.isFetching}
											component={AutocompleteField}
											options={productUnit?.data?.map((unit) => ({
												value: unit.id,
												label: unit.name,
											}))}
											isRequired={true}
										/>
										{!openProductUnitForm && (
											<Button
												variant="text"
												onClick={handleProductUnitOpen}
												startIcon={<AddIcon />}
											>
												{t("productForm.addUnit")}
											</Button>
										)}
										{openProductUnitForm && (
											<CreateProductUnit handleClose={handleProductUnitClose} />
										)}
									</Grid>

									{isIndia && (
										<Grid item xs={12}>
											<Field
												name="hsnCode_id"
												label={t("productForm.hsnCodeIndia")}
												component={AutocompleteField}
												loading={hsnCodes.isLoading || hsnCodes.isFetching}
												options={hsnCodes?.data?.map((item) => {
													return {
														label: `${item?.code} - ${item?.tax?.percentage}%`,
														value: item?.id,
													};
												})}
												onValueChange={(value: ListDto) => {
													if (value) {
														const selectedHsnCode = hsnCodes.data?.find(
															(item) => item.id === value.value,
														);
														if (selectedHsnCode) {
															setFieldValue("tax", [
																...(values.tax ?? []),
																selectedHsnCode.tax?.id ?? "",
															]);
														}
													}
												}}
											/>
											{!openHsnCodeForm && (
												<Button variant="text" onClick={handleHsnCodeOpen} startIcon={<AddIcon />}>
													{t("productForm.addHsn")}
												</Button>
											)}
											{openHsnCodeForm && <CreateHSNCode handleClose={handleHsnCodeClose} />}
										</Grid>
									)}

									<Grid item xs={12}>
										<Field
											name="tax"
											label={t("productForm.taxes")}
											multiple
											component={AutocompleteField}
											loading={taxCodes.isLoading || taxCodes.isFetching}
											options={taxCodes?.data?.map((item) => {
												return {
													label: [item?.name, item?.percentage ? `${item?.percentage}%` : ""]
														.filter(Boolean)
														.join(" - "),
													value: item?.id,
												};
											})}
										/>
										{!openTaxesForm && (
											<Button variant="text" onClick={handleTaxesOpen} startIcon={<AddIcon />}>
												{t("productForm.addTaxes")}
											</Button>
										)}
										{openTaxesForm && <CreateTaxes handleClose={handleTaxesClose} />}
									</Grid>
									<Grid item xs={12}>
										<Box>
											<Typography variant="h6" gutterBottom>
												{t("productForm.priceBook")}
											</Typography>
										</Box>
										<Box>
											<FieldArray
												name="priceBook"
												render={(arrayHelpers) => (
													<>
														{values.priceBook && values.priceBook.length > 0 ? (
															values.priceBook.map((_, index) => (
																<Box key={index} sx={{ mb: 1 }}>
																	<Grid container spacing={2} alignItems="center">
																		<Grid item xs={5}>
																			<Field
																				name={`priceBook.${index}.currency_id`}
																				label={t("productForm.currency")}
																				component={AutocompleteField}
																				options={currencyList?.data
																					?.filter(
																						(currency) =>
																							currency.short_code === "EUR" ||
																							currency.short_code === "INR",
																					)
																					?.map((currency) => ({
																						value: currency.id,
																						label: `${currency.short_code} - ${currency.name}`,
																					}))}
																				isRequired={true}
																			/>
																		</Grid>
																		<Grid item xs={5}>
																			<Field
																				name={`priceBook.${index}.price`}
																				component={TextFormField}
																				label={t("productForm.price")}
																				type="number"
																				isRequired={true}
																				marginWholeTop={-0.1}
																			/>
																		</Grid>
																		<Grid item xs={2}>
																			<CustomIconButton
																				src={CloseIcon}
																				buttonType="delete"
																				iconColor="error"
																				onClick={() => arrayHelpers.remove(index)}
																			/>
																		</Grid>
																	</Grid>
																</Box>
															))
														) : (
															<Typography variant="body2" color="error">
																{t("productForm.noPriceBook")}
															</Typography>
														)}
														<Button
															variant="outlined"
															startIcon={<AddIcon />}
															onClick={() => arrayHelpers.push({ currency_id: "", price: 0 })}
														>
															{t("productForm.addPrice")}
														</Button>
													</>
												)}
											/>
										</Box>
									</Grid>

									<Grid item xs={12} mt={2}>
										<Field
											name="description"
											component={TextFormField}
											label={t("productForm.description")}
											multiline
											rows={5}
										/>
									</Grid>

									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											{t("productForm.save")}
										</Button>
									</Grid>
								</Grid>
							</Form>
						);
					}}
				</Formik>
			</Box>
		</Box>
	);
};

export default ProductForm;
