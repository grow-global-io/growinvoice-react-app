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
import { useEffect, useRef, useMemo } from "react";
import { productFormTooltips } from "@shared/tooltips";
import { FieldWithTooltip } from "@shared/components/FormFields/FieldWithTooltip";

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
				sellPrice: yup
					.number()
					.typeError(() => i18n.t("productForm.validation.priceNumber"))
					.nullable()
					.optional(),
				shippingCharges: yup.number().nullable().optional(),
			}),
		)
		.required(() => i18n.t("productForm.validation.priceBookRequired"))
		.min(1, () => i18n.t("productForm.validation.priceBookAtLeastOne")),
});

// Helper component to auto-select first tax when taxes load asynchronously
const TaxPrefillHelper = ({
	editValues,
	taxCodes,
	setFieldValue,
	currentTaxValues,
}: {
	editValues: any;
	taxCodes: any;
	setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
	currentTaxValues: string[] | null | undefined;
}) => {
	const taxPrefilledRef = useRef(false);
	const previousEditValuesRef = useRef(editValues);

	useEffect(() => {
		// Reset prefilled flag when switching between edit and create modes
		if (previousEditValuesRef.current !== editValues) {
			taxPrefilledRef.current = false;
			previousEditValuesRef.current = editValues;
		}

		// Don't prefill if we're in edit mode
		if (editValues) {
			return;
		}

		// Auto-select first tax when:
		// 1. Not editing (editValues is null/undefined)
		// 2. Tax codes are loaded and not loading
		// 3. Haven't already prefilled
		// 4. Tax field is currently empty
		if (
			taxCodes?.data &&
			taxCodes.data.length > 0 &&
			!taxCodes.isLoading &&
			!taxCodes.isFetching &&
			!taxPrefilledRef.current &&
			(!currentTaxValues || currentTaxValues.length === 0)
		) {
			// Auto-select the first tax
			setFieldValue("tax", [taxCodes.data[0].id], false);
			taxPrefilledRef.current = true;
		}
	}, [
		editValues,
		taxCodes?.data,
		taxCodes?.isLoading,
		taxCodes?.isFetching,
		setFieldValue,
		currentTaxValues,
	]);

	return null;
};

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
		values: CreateProductWithTaxDto & {
			priceBook: Array<{
				currency_id: string;
				price: number;
				sellPrice?: number;
				shippingCharges?: number;
			}>;
		},
		action: FormikHelpers<CreateProductWithTaxDto>,
	) => {
		if (isGetStartedDialogOpen()) {
			AlertService.instance.errorMessage(
				"Please complete the Get Started process before creating a product.",
			);
			return;
		}
		action.setSubmitting(true);
		// Remove sellPrice from priceBook before sending to API (API only accepts currency_id and price)
		const transformedValues = {
			...values,
			hsnCode_id: values.hsnCode_id === "" ? null : values.hsnCode_id,
			priceBook: values.priceBook.map(({ currency_id, price, shippingCharges }) => ({
				currency_id,
				price,
				shippingCharges,
			})),
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

	// Calculate initial tax values - auto-select first tax for all users when creating new product
	const initialTaxValues = useMemo(() => {
		// If editing, use existing taxes
		if (editValues?.tax) {
			return editValues.tax.map((tax) => tax.tax_id);
		}

		// If creating new product, auto-select the first tax
		if (!editValues && taxCodes?.data && taxCodes.data.length > 0) {
			return [taxCodes.data[0].id];
		}

		return [];
	}, [editValues, taxCodes?.data]);

	const initialValues: CreateProductWithTaxDto = useMemo(
		() => ({
			type: editValues?.type ?? "Goods",
			name: editValues?.name ?? "",
			unit_id: editValues?.unit_id ?? "",
			hsnCode_id: editValues?.hsnCode_id ?? "",
			tax: initialTaxValues,
			description: editValues?.description ?? "",
			user_id: user?.id ?? "",
			priceBook:
				editValues?.priceBook?.map((price) => {
					// Calculate sellPrice from price and tax if editing
					const taxPercentage =
						taxCodes?.data
							?.filter((t) => editValues?.tax?.map((tax: any) => tax.tax_id).includes(t.id))
							?.map((t) => t.percentage)
							?.reduce((acc, curr) => acc + curr, 0) ?? 0;
					const calculatedSellPrice = parseFloat(
						(price.price + (price.price * taxPercentage) / 100).toFixed(2),
					);
					return {
						currency_id: price.currency_id,
						price: price.price,
						sellPrice: calculatedSellPrice,
						shippingCharges: price.shippingCharges ?? 0,
					};
				}) ?? [],
			images: editValues?.images ?? [],
			includeStore: editValues?.includeStore ?? false,
		}),
		[editValues, initialTaxValues, user?.id, taxCodes?.data],
	);

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
				<Formik
					initialValues={initialValues}
					validationSchema={schema}
					onSubmit={handleSubmit}
					enableReinitialize={true}
				>
					{({ values, setFieldValue, errors }) => {
						console.log("errors", errors);
						return (
							<Form>
								<TaxPrefillHelper
									editValues={editValues}
									taxCodes={taxCodes}
									setFieldValue={setFieldValue}
									currentTaxValues={values.tax}
								/>
								<Divider />
								<Grid container my={1} padding={2}>
									<Grid item xs={12}>
										<FieldWithTooltip
											tooltipTitle={t(productFormTooltips.type.titleKey)}
											tooltipDescription={t(productFormTooltips.type.descriptionKey)}
										>
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
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12}>
										<FieldWithTooltip
											tooltipTitle={t(productFormTooltips.name.titleKey)}
											tooltipDescription={t(productFormTooltips.name.descriptionKey)}
										>
											<Field
												name="name"
												component={TextFormField}
												label={t("productForm.productName")}
												isRequired={true}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12}>
										<FieldWithTooltip
											tooltipTitle={t(productFormTooltips.includeStore.titleKey)}
											tooltipDescription={t(productFormTooltips.includeStore.descriptionKey)}
										>
											<Field
												name="includeStore"
												label={t("productForm.includeStore")}
												component={CheckBoxFormField}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12}>
										<FieldWithTooltip
											tooltipTitle={t(productFormTooltips.images.titleKey)}
											tooltipDescription={t(productFormTooltips.images.descriptionKey)}
										>
											<Field
												name="images"
												label={t("productForm.productImages")}
												component={MultipleFileUploadFormField}
												accept="image/*"
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12}>
										<FieldWithTooltip
											tooltipTitle={t(productFormTooltips.unit_id.titleKey)}
											tooltipDescription={t(productFormTooltips.unit_id.descriptionKey)}
										>
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
										</FieldWithTooltip>
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
											<FieldWithTooltip
												tooltipTitle={t(productFormTooltips.hsnCode_id.titleKey)}
												tooltipDescription={t(productFormTooltips.hsnCode_id.descriptionKey)}
											>
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
											</FieldWithTooltip>
											{!openHsnCodeForm && (
												<Button variant="text" onClick={handleHsnCodeOpen} startIcon={<AddIcon />}>
													{t("productForm.addHsn")}
												</Button>
											)}
											{openHsnCodeForm && <CreateHSNCode handleClose={handleHsnCodeClose} />}
										</Grid>
									)}

									<Grid item xs={12}>
										<FieldWithTooltip
											tooltipTitle={t(productFormTooltips.tax.titleKey)}
											tooltipDescription={t(productFormTooltips.tax.descriptionKey)}
										>
											<Field
												name="tax"
												label={t("productForm.taxes")}
												multiple
												component={AutocompleteField}
												loading={taxCodes.isLoading || taxCodes.isFetching}
												options={(() => {
													// Get currently selected tax IDs
													const selectedTaxIds = values.tax || [];
													// Get currently selected taxes data
													const selectedTaxes =
														taxCodes?.data?.filter((tax) => selectedTaxIds.includes(tax.id)) || [];

													// First, deduplicate taxes by name+percentage (keep only one per unique combination)
													const seenTaxes = new Map<string, string>(); // key: "name-percentage", value: taxId
													const uniqueTaxes =
														taxCodes?.data?.filter((item) => {
															const percentage = item?.percentage ?? 0;
															const key = `${item.name}-${percentage}`;
															if (seenTaxes.has(key)) {
																// If already seen, only keep it if it's already selected
																return selectedTaxIds.includes(item.id);
															}
															seenTaxes.set(key, item.id);
															return true;
														}) || [];

													// Map unique taxes to options
													return (
														uniqueTaxes
															.map((item) => {
																// Always show percentage, including 0%
																const percentage = item?.percentage ?? 0;
																return {
																	label: `${item?.name} - ${percentage}%`,
																	value: item?.id,
																};
															})
															.filter((option) => {
																// If this tax is already selected, keep it in options
																if (selectedTaxIds.includes(option.value)) {
																	return true;
																}
																// Otherwise, check if it would be a duplicate of already selected
																const taxItem = taxCodes?.data?.find(
																	(tax) => tax.id === option.value,
																);
																if (!taxItem) return false;

																// Check if a tax with same name and percentage is already selected
																const isDuplicate = selectedTaxes.some(
																	(selectedTax) =>
																		selectedTax.name === taxItem.name &&
																		selectedTax.percentage === taxItem.percentage,
																);

																// Filter out duplicates
																return !isDuplicate;
															}) || []
													);
												})()}
												onValueChange={(value: ListDto) => {
													if (!value) return;

													// Get current selected tax IDs
													const currentTaxIds = values.tax || [];
													// Get the tax data for the newly selected tax
													const newTax = taxCodes?.data?.find((tax) => tax.id === value.value);

													if (newTax) {
														// Check if a tax with same name and percentage already exists
														const selectedTaxes =
															taxCodes?.data?.filter((tax) => currentTaxIds.includes(tax.id)) || [];

														const isDuplicate = selectedTaxes.some(
															(selectedTax) =>
																selectedTax.name === newTax.name &&
																selectedTax.percentage === newTax.percentage &&
																selectedTax.id !== newTax.id,
														);

														if (isDuplicate) {
															AlertService.instance.errorMessage(
																t("productForm.duplicateTaxError", {
																	defaultValue: `Tax "${newTax.name} - ${newTax.percentage}%" is already added.`,
																}),
															);
															return; // Don't add the duplicate
														}
													}
												}}
											/>
										</FieldWithTooltip>
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
															values.priceBook.map((_, index) => {
																// Calculate tax percentage from selected taxes
																const taxPercentage =
																	taxCodes?.data
																		?.filter((t) => values.tax?.includes(t.id))
																		?.map((t) => t.percentage)
																		?.reduce((acc, curr) => acc + curr, 0) ?? 0;

																// Recalculate sellPrice when tax changes (if stock price exists)
																const currentStockPrice =
																	typeof values.priceBook[index]?.price === "number"
																		? values.priceBook[index]?.price
																		: parseFloat(String(values.priceBook[index]?.price || 0)) || 0;
																if (currentStockPrice > 0) {
																	const calculatedSellPrice =
																		taxPercentage > 0
																			? parseFloat(
																					(currentStockPrice * (1 + taxPercentage / 100)).toFixed(
																						2,
																					),
																				)
																			: parseFloat(currentStockPrice.toFixed(2));
																	// Only update if different to avoid infinite loops
																	const priceBookItem = values.priceBook[index] as any;
																	const currentSellPrice =
																		parseFloat(String(priceBookItem?.sellPrice || 0)) || 0;
																	if (Math.abs(calculatedSellPrice - currentSellPrice) > 0.01) {
																		setFieldValue(
																			`priceBook.${index}.sellPrice`,
																			calculatedSellPrice,
																		);
																	}
																}

																// Handler for Stock Price change
																const handleStockPriceChange = (value: string) => {
																	// Allow empty values during editing
																	if (value === "" || value === null || value === undefined) {
																		setFieldValue(`priceBook.${index}.price`, "");
																		setFieldValue(`priceBook.${index}.sellPrice`, "");
																		return;
																	}
																	const parsedValue = parseFloat(value);
																	if (isNaN(parsedValue)) {
																		return; // Don't update if not a valid number
																	}
																	const newStockPrice = parseFloat(parsedValue.toFixed(2)); // Round to 2 decimal places
																	// Calculate sell price: Stock Price * (1 + tax percentage / 100)
																	const newSellPrice =
																		taxPercentage > 0
																			? parseFloat(
																					(newStockPrice * (1 + taxPercentage / 100)).toFixed(2),
																				)
																			: newStockPrice;
																	setFieldValue(`priceBook.${index}.price`, newStockPrice);
																	setFieldValue(`priceBook.${index}.sellPrice`, newSellPrice);
																};

																// Handler for Selling Price change
																const handleSellPriceChange = (value: string) => {
																	// Allow empty values during editing
																	if (value === "" || value === null || value === undefined) {
																		setFieldValue(`priceBook.${index}.sellPrice`, "");
																		setFieldValue(`priceBook.${index}.price`, "");
																		return;
																	}
																	const parsedValue = parseFloat(value);
																	if (isNaN(parsedValue)) {
																		return; // Don't update if not a valid number
																	}
																	const newSellPrice = parseFloat(parsedValue.toFixed(2)); // Round to 2 decimal places
																	// Calculate stock price: Selling Price / (1 + tax percentage / 100)
																	const newStockPrice =
																		taxPercentage > 0
																			? parseFloat(
																					(newSellPrice / (1 + taxPercentage / 100)).toFixed(2),
																				)
																			: newSellPrice;
																	setFieldValue(`priceBook.${index}.sellPrice`, newSellPrice);
																	setFieldValue(`priceBook.${index}.price`, newStockPrice);
																};

																return (
																	<Box
																		key={index}
																		sx={{ mb: 1, overflow: "visible", position: "relative" }}
																	>
																		<Grid
																			container
																			spacing={2}
																			alignItems="center"
																			sx={{ overflow: "visible" }}
																		>
																			{/* First Row: Currency and Stock Price */}
																			<Grid item xs={6} sx={{ overflow: "visible" }}>
																				<FieldWithTooltip
																					tooltipTitle={t(productFormTooltips.currency_id.titleKey)}
																					tooltipDescription={t(
																						productFormTooltips.currency_id.descriptionKey,
																					)}
																				>
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
																				</FieldWithTooltip>
																			</Grid>
																			<Grid item xs={5} sx={{ overflow: "visible" }}>
																				<FieldWithTooltip
																					tooltipTitle={t(productFormTooltips.price.titleKey)}
																					tooltipDescription={t(
																						productFormTooltips.price.descriptionKey,
																					)}
																				>
																					<Field
																						name={`priceBook.${index}.price`}
																						component={TextFormField}
																						label={t("productForm.stockPrice", {
																							defaultValue: "Stock Price",
																						})}
																						type="number"
																						step="0.01"
																						isRequired={true}
																						marginWholeTop={-0.1}
																						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																							handleStockPriceChange(e.target.value);
																						}}
																					/>
																				</FieldWithTooltip>
																			</Grid>
																			<Grid item xs={1}>
																				{/* Empty space for delete button positioning */}
																			</Grid>
																			{/* Second Row: Selling Price and Shipping Price */}
																			<Grid item xs={6} sx={{ overflow: "visible" }}>
																				<FieldWithTooltip
																					tooltipTitle={t(productFormTooltips.sellPrice.titleKey)}
																					tooltipDescription={t(
																						productFormTooltips.sellPrice.descriptionKey,
																					)}
																				>
																					<Field
																						name={`priceBook.${index}.sellPrice`}
																						component={TextFormField}
																						label={t("productForm.sellPrice", {
																							defaultValue: "Selling Price",
																						})}
																						type="number"
																						step="0.01"
																						isRequired={true}
																						marginWholeTop={-0.1}
																						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																							handleSellPriceChange(e.target.value);
																						}}
																					/>
																				</FieldWithTooltip>
																			</Grid>
																			<Grid item xs={5} sx={{ overflow: "visible" }}>
																				<FieldWithTooltip
																					tooltipTitle={t(
																						productFormTooltips.shippingCharges.titleKey,
																					)}
																					tooltipDescription={t(
																						productFormTooltips.shippingCharges.descriptionKey,
																					)}
																				>
																					<Field
																						name={`priceBook.${index}.shippingCharges`}
																						type="number"
																						isRequired={false}
																						label={"Shipping Price"}
																						component={TextFormField}
																						marginWholeTop={-0.1}
																					/>
																				</FieldWithTooltip>
																			</Grid>
																			<Grid item xs={1}>
																				{/* Empty space for delete button positioning */}
																			</Grid>
																		</Grid>
																		{/* Delete button positioned between the two rows */}
																		<Box
																			sx={{
																				position: "absolute",
																				right: 0,
																				top: "50%",
																				transform: "translateY(-50%)",
																				display: "flex",
																				alignItems: "center",
																				justifyContent: "center",
																			}}
																		>
																			<CustomIconButton
																				src={CloseIcon}
																				buttonType="delete"
																				iconColor="error"
																				onClick={() => arrayHelpers.remove(index)}
																			/>
																		</Box>
																	</Box>
																);
															})
														) : (
															<Typography variant="body2" color="error">
																{t("productForm.noPriceBook")}
															</Typography>
														)}
														<Button
															variant="outlined"
															startIcon={<AddIcon />}
															onClick={() => {
																// Calculate initial sellPrice based on current tax
																arrayHelpers.push({
																	currency_id: "",
																	price: "",
																	sellPrice: "",
																});
															}}
														>
															{t("productForm.addPrice")}
														</Button>
													</>
												)}
											/>
										</Box>
									</Grid>

									<Grid item xs={12} mt={2}>
										<FieldWithTooltip
											tooltipTitle={t(productFormTooltips.description.titleKey)}
											tooltipDescription={t(productFormTooltips.description.descriptionKey)}
										>
											<Field
												name="description"
												component={TextFormField}
												label={t("productForm.description")}
												multiline
												rows={5}
											/>
										</FieldWithTooltip>
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
