import { Box, Grid, Typography, IconButton, Button, Divider } from "@mui/material";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { Constants } from "@shared/constants";
import { Formik, Field, Form, FormikHelpers } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import * as yup from "yup";
import { useDialog } from "@shared/hooks/useDialog";
import CreateProductUnit from "../ProductUnit/CreateProductUnit";
import CreateHSNCode from "../HSNCode/CreateHSNCode";
import CreateTaxes from "../ProductTaxes/CreateTaxes";
import { useCreateProductStore } from "@store/createProductStore";
import { CreateProductDto, CreateProductDtoType } from "@api/services/models";
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

const schema: yup.Schema<CreateProductDto> = yup.object({
	type: yup
		.string()
		.required("Type is required")
		.oneOf(Object.values(CreateProductDtoType), "Invalid Type"),
	name: yup.string().required("Name is required"),
	unit_id: yup.string().required("Unit is required"),
	hsnCode_id: yup.string(),
	tax_id: yup.string(),
	currency_id: yup.string().required("Currency is required"),
	price: yup
		.number()
		.typeError("Price must be a number")
		.required("Price is required")
		.min(1, "Price should be greater than 0"),
	description: yup.string().nullable(),
	user_id: yup.string().required("User id is required"),
});

const ProductForm = () => {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const createProduct = useProductControllerCreate();
	const { setOpenProductForm, editValues } = useCreateProductStore.getState();
	const productUnit = useProductunitControllerFindAll();
	const hsnCodes = useHsncodeControllerFindAll();
	const taxCodes = useTaxcodeControllerFindAll();
	const currencyList = useCurrencyControllerFindAll();
	const updateProduct = useProductControllerUpdate();

	const handleSubmit = async (
		values: CreateProductDto,
		action: FormikHelpers<CreateProductDto>,
	) => {
		action.setSubmitting(true);
		const transformedValues = {
			...values,
			price: Number(values.price), // Ensure the price is a number before submission
			tax_id: values.tax_id === "" ? null : values.tax_id,
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

	const initialValues: CreateProductDto = {
		type: editValues?.type ?? "Good",
		name: editValues?.name ?? "",
		unit_id: editValues?.unit_id ?? "",
		hsnCode_id: editValues?.hsnCode_id ?? "",
		tax_id: editValues?.tax_id ?? "",
		currency_id: editValues?.currency_id ?? "",
		price: editValues?.price ?? 0,
		description: editValues?.description ?? "",
		user_id: user?.id ?? "",
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
					{({ setFieldValue }) => (
						<Form>
							<Divider />
							<Grid container my={1} padding={2}>
								<Grid item xs={12}>
									<Field
										name="type"
										label="Type"
										component={AutocompleteField}
										options={Object.values(CreateProductDtoType).map(stringToListDto)}
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
								<Field
									name="currency_id"
									label="Currency"
									loading={currencyList.isLoading || currencyList.isFetching}
									component={AutocompleteField}
									options={currencyList?.data?.map((currency) => ({
										value: currency.id,
										label: `${currency.short_code} - ${currency.name}`,
									}))}
									isRequired={true}
								/>

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
										<Button variant="text" onClick={handleProductUnitOpen} startIcon={<AddIcon />}>
											Add Unit
										</Button>
									)}
									{openProductUnitForm && (
										<CreateProductUnit handleClose={handleProductUnitClose} />
									)}
								</Grid>

								<Grid item xs={12}>
									<Field
										name="hsnCode_id"
										label="HSN Code (India)"
										component={AutocompleteField}
										loading={hsnCodes.isLoading || hsnCodes.isFetching}
										options={hsnCodes?.data?.map((item) => {
											return {
												label: `${item?.code}`,
												value: item?.id,
											};
										})}
										onValueChange={(value: ListDto) => {
											if (value) {
												const hsnCode = hsnCodes?.data?.find((item) => item.id === value.value);
												setFieldValue("tax_id", hsnCode?.tax_id);
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

								<Grid item xs={12}>
									<Field
										name="tax_id"
										label="Taxes"
										component={AutocompleteField}
										loading={taxCodes.isLoading || taxCodes.isFetching}
										options={taxCodes?.data?.map((item) => {
											return {
												label: item?.percentage + "%",
												value: item?.id,
											};
										})}
										onValueChange={(value: ListDto) => {
											if (value === undefined) {
												setFieldValue("hsnCode_id", "");
											} else if (value) {
												const taxCode = hsnCodes?.data?.find((item) => item.tax_id === value.value);
												setFieldValue("hsnCode_id", taxCode?.id ?? "");
											}
										}}
									/>
									{!openTaxesForm && (
										<Button variant="text" onClick={handleTaxesOpen} startIcon={<AddIcon />}>
											Add Taxes
										</Button>
									)}
									{openTaxesForm && <CreateTaxes handleClose={handleTaxesClose} />}
								</Grid>

								<Grid item xs={12}>
									<Field
										name="price"
										component={TextFormField}
										label="Price"
										type="number" // Change to text to handle empty string
										isRequired={true}
									/>
								</Grid>

								<Grid item xs={12}>
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
					)}
				</Formik>
			</Box>
		</Box>
	);
};

export default ProductForm;
