import { Box, Grid, Typography, IconButton, Button, Divider } from "@mui/material";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { Constants } from "@shared/constants";
import { Formik, Field, Form, FormikHelpers, FieldArray } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import * as yup from "yup";
import { useDialog } from "@shared/hooks/useDialog";
import CreateProductUnit from "../ProductUnit/CreateProductUnit";
import CreateHSNCode from "../HSNCode/CreateHSNCode";
import CreateTaxes from "../ProductTaxes/CreateTaxes";
import { useCreateProductStore } from "@store/createProductStore";
import { CreateProductWithTaxDto, CreateProductWithTaxDtoType } from "@api/services/models";
import { useAuthStore } from "@store/auth";
import { ListDto, stringToListDto } from "@shared/models/ListDto";
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

const schema = yup.object({
	type: yup
		.string()
		.required("Type is required")
		.oneOf(Object.values(CreateProductWithTaxDtoType), "Invalid Type"),
	name: yup.string().required("Name is required"),
	unit_id: yup.string().required("Unit is required"),
	hsnCode_id: yup.string(),
	images: yup
		.array()
		.of(yup.string().url("Each image must be a valid URL"))
		.test(
			"includeStore",
			"At least one image is required when including the product in the store.",
			function (value) {
				const { includeStore } = this.parent;
				if (includeStore && (!value || value.length === 0)) {
					return this.createError({
						message: "At least one image is required when including the product in the store.",
					});
				}
				return true;
			},
		)
		.required("Images are required")
		.default([]),

	includeStore: yup.boolean().optional(),
	// currency_id: yup.string().required("Currency is required"),
	// price: yup
	// 	.number()
	// 	.typeError("Price must be a number")
	// 	.required("Price is required")
	// 	.min(0.0000000001, "Price should be greater than 0"),
	description: yup.string().nullable(),
	user_id: yup.string().required("User id is required"),
	tax: yup.array().of(yup.string().required("Tax is required")).nullable().default([]),
	priceBook: yup
		.array()
		.of(
			yup.object({
				currency_id: yup.string().required("Currency is required"),
				price: yup
					.number()
					.typeError("Price must be a number")
					.required("Price is required")
					.min(0.0000000001, "Price should be greater than 0"),
			}),
		)
		.required("Price book is required")
		.min(1, "At least one price book is required"),
});

const ProductForm = () => {
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
					<img src={Constants.customImages.ProductSymbol} alt="Invoice Icon" /> New Product
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
											label="Type"
											component={AutocompleteField}
											options={Object.values(CreateProductWithTaxDtoType).map(stringToListDto)}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="name"
											component={TextFormField}
											label="Product Name"
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="includeStore"
											label="Include in Store Products"
											component={CheckBoxFormField}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="images"
											label="Product Images"
											component={MultipleFileUploadFormField}
											accept="image/*"
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="unit_id"
											label="Unit"
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
												Add Unit
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
												label="HSN Code (India)"
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
													Add HSN
												</Button>
											)}
											{openHsnCodeForm && <CreateHSNCode handleClose={handleHsnCodeClose} />}
										</Grid>
									)}

									<Grid item xs={12}>
										<Field
											name="tax"
											label="Taxes"
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
												Add Taxes
											</Button>
										)}
										{openTaxesForm && <CreateTaxes handleClose={handleTaxesClose} />}
									</Grid>
									<Grid item xs={12}>
										<Box>
											<Typography variant="h6" gutterBottom>
												Price Book
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
																				label="Currency"
																				component={AutocompleteField}
																				options={currencyList?.data?.map((currency) => ({
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
																				label="Price"
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
																No price book entries found. Please add at least one.
															</Typography>
														)}
														<Button
															variant="outlined"
															startIcon={<AddIcon />}
															onClick={() => arrayHelpers.push({ currency_id: "", price: 0 })}
														>
															Add Price
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
											label="Description"
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
						);
					}}
				</Formik>
			</Box>
		</Box>
	);
};

export default ProductForm;
