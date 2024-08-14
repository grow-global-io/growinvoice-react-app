import {
	Box,
	Grid,
	Typography,
	Divider,
	Button,
	IconButton,
	FormControl,
	FormControlLabel,
	Checkbox,
} from "@mui/material";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { Constants } from "@shared/constants";
import { Formik, Field, Form, FormikHelpers } from "formik";
import * as yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import {
	CreateCustomerWithAddressDto,
	CreateCustomerWithAddressDtoOption,
} from "@api/services/models";
import { stringToListDto } from "@shared/models/ListDto";
import {
	useCurrencyControllerFindAll,
	useCurrencyControllerFindCountries,
} from "@api/services/currency";
import StateFormField from "@shared/components/FormFields/StateFormField";
import {
	getCustomerControllerCustomerCountQueryKey,
	getCustomerControllerFindAllQueryKey,
	getCustomerControllerFindOneQueryKey,
	useCustomerControllerCreate,
	useCustomerControllerUpdate,
} from "@api/services/customer";
import { useAuthStore } from "@store/auth";
import { RegexExp } from "@shared/regex";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@shared/components/Loader";

const CustomerForm = () => {
	const queryClient = useQueryClient();
	const countryFindAll = useCurrencyControllerFindCountries();
	const createCustomer = useCustomerControllerCreate();
	const currencyList = useCurrencyControllerFindAll();
	const { user } = useAuthStore();
	const updateCustomer = useCustomerControllerUpdate();

	const { setOpenCustomerForm, editValues } = useCreateCustomerStore.getState();
	const initialValues: CreateCustomerWithAddressDto = {
		currencies_id: editValues?.currencies_id ?? "",
		name: editValues?.name ?? "",
		option: editValues?.option ?? CreateCustomerWithAddressDtoOption.Freelancer,
		user_id: user?.id ?? "",
		billingDetails: {
			address: editValues?.billingAddress?.address ?? "",
			city: editValues?.billingAddress?.city ?? "",
			country_id: editValues?.billingAddress?.country_id ?? "",
			state_id: editValues?.billingAddress?.state_id ?? "",
			zip: editValues?.billingAddress?.zip ?? "",
		},
		shippingDetails: {
			address: editValues?.shippingAddress?.address ?? "",
			city: editValues?.shippingAddress?.city ?? "",
			country_id: editValues?.shippingAddress?.country_id ?? "",
			state_id: editValues?.shippingAddress?.state_id ?? "",
			zip: editValues?.shippingAddress?.zip ?? "",
		},
		display_name: editValues?.display_name ?? "",
		email: editValues?.email ?? "",
		phone: editValues?.phone ?? "",
		website: editValues?.website ?? "",
	};

	const schema: yup.Schema<CreateCustomerWithAddressDto> = yup.object({
		currencies_id: yup.string().required("Currency is required"),
		name: yup
			.string()
			.required("Name is required")
			.matches(RegexExp.fullNameRegex, "Name is invalid"),
		option: yup
			.string()
			.required("Option is required")
			.oneOf(Object.values(CreateCustomerWithAddressDtoOption), "Invalid Type"),
		user_id: yup.string().required("User is required"),
		billingDetails: yup.object().shape({
			address: yup.string().required("Address is required"),
			city: yup.string().required("City is required"),
			country_id: yup.string().required("Country is required"),
			state_id: yup.string().required("State is required"),
			zip: yup.string().required("Zip is required"),
		}),
		shippingDetails: yup.object().shape({
			address: yup.string().required("Address is required"),
			city: yup.string().required("City is required"),
			country_id: yup.string().required("Country is required"),
			state_id: yup.string().required("State is required"),
			zip: yup.string().required("Zip is required"),
		}),
		display_name: yup.string().required("Display Name is required"),
		email: yup.string().required("Email is required").email("Email is invalid"),
		phone: yup.string().test("is-phone", "Phone number is not valid", function (value) {
			if (!value) return true;
			return isValidPhoneNumber(value);
		}),
		website: yup.string().matches(RegexExp.linkRegex, "Website is invalid"),
	});

	const handleSubmit = async (
		values: CreateCustomerWithAddressDto,
		actions: FormikHelpers<CreateCustomerWithAddressDto>,
	) => {
		actions.setSubmitting(true);
		if (editValues !== null) {
			await updateCustomer.mutateAsync({
				id: editValues.id,
				data: values,
			});
			queryClient.invalidateQueries({
				queryKey: getCustomerControllerFindOneQueryKey(editValues?.id ?? ""),
			});
		} else {
			await createCustomer.mutateAsync({
				data: values,
			});
			await queryClient.refetchQueries({
				queryKey: getCustomerControllerCustomerCountQueryKey(),
			});
		}
		queryClient.invalidateQueries({
			queryKey: getCustomerControllerFindAllQueryKey(),
		});

		actions.resetForm();
		setOpenCustomerForm(false);
		actions.setSubmitting(false);
	};

	if (countryFindAll.isLoading || currencyList.isLoading) return <Loader />;

	return (
		<Box sx={{ width: { lg: "700px" } }} role="presentation">
			<Grid container justifyContent={"space-between"} padding={2}>
				<Typography
					variant="h4"
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<img src={Constants.customImages.CustomerImg} alt="Invoice Icon" /> Add New Customer
				</Typography>
				<IconButton
					sx={{
						color: "secondary.dark",
					}}
					onClick={() => setOpenCustomerForm(false)}
				>
					<CloseIcon />
				</IconButton>
			</Grid>

			<Box sx={{ mb: 2, mt: 2 }}>
				<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
					{({ errors, values, setFieldValue }) => {
						return (
							<Form>
								<Divider />
								<Box padding={2}>
									<Grid container spacing={2} bgcolor={"custom.lightgray"}>
										<Grid item xs={12} sm={8}>
											<Field
												name="option"
												label="Customer Type"
												component={AutocompleteField}
												options={Object.values(CreateCustomerWithAddressDtoOption).map(
													stringToListDto,
												)}
												isRequired={true}
											/>
										</Grid>

										<Grid item xs={12} sm={6}>
											<Field
												name="name"
												label="Customer Name"
												component={TextFormField}
												isRequired={true}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Field
												name="display_name"
												label="Display Name"
												component={TextFormField}
												isRequired={true}
											/>
										</Grid>
										{/* <Grid item xs={12} sm={8}>
									<Field
										name="gstNumber"
										label="GST Number"
										component={TextFormField}
										type="number"
									/>
								</Grid> */}
										<Grid item xs={12} sm={6}>
											<Field
												name="email"
												label="Email"
												component={TextFormField}
												isRequired={true}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Field name="phone" label="Phone" component={PhoneInputFormField} />
										</Grid>
										<Grid item xs={12} sm={6}>
											<Field name="website" label="Website" component={TextFormField} />
										</Grid>
										<Grid item xs={12} sm={6}>
											<Field
												name="currencies_id"
												label="Currency"
												loading={currencyList.isLoading || currencyList.isFetching}
												component={AutocompleteField}
												options={currencyList?.data?.map((currency) => ({
													value: currency.id,
													label: `${currency.short_code} - ${currency.name}`,
												}))}
												isRequired={true}
											/>
										</Grid>
									</Grid>
									<Grid container spacing={2} my={1}>
										<Grid item xs={12} sm={12}>
											<Typography
												variant="h4"
												color={"secondary.dark"}
												sx={{
													display: "flex",
													alignItems: "center",
													gap: 1,
												}}
											>
												<img src={Constants.customImages.BillingAddressIcon} alt="Invoice Icon" />{" "}
												Billing Address
											</Typography>
										</Grid>
										<Grid item xs={12}>
											<Grid container spacing={1}>
												<Grid item xs={12} sm={6}>
													<Field
														name="billingDetails.country_id"
														component={AutocompleteField}
														label="Country"
														options={countryFindAll?.data?.map((item) => ({
															label: item.name,
															value: item.id,
														}))}
														loading={countryFindAll.isLoading}
														isRequired={true}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													{/* <Field
												name="billingDetails.state_id"
												component={AutocompleteField}
												label="State"
											/> */}
													<StateFormField
														countryFieldName="billingDetails.country_id"
														stateFieldName="billingDetails.state_id"
														stateLabel="State"
														isRequired={true}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														name="billingDetails.city"
														component={TextFormField}
														label="City"
														isRequired={true}
													/>
													<Field
														name="billingDetails.zip"
														component={TextFormField}
														label="Zip Code"
														isRequired={true}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														name="billingDetails.address"
														component={TextFormField}
														label="Address"
														multiline
														rows={6}
														isRequired={true}
													/>
												</Grid>
											</Grid>
										</Grid>
									</Grid>
									<Divider />
									<Grid container my={1}>
										<Typography
											variant="h4"
											color={"secondary.dark"}
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
											}}
										>
											<img src={Constants.customImages.BillingAddressIcon} alt="Invoice Icon" />{" "}
											Shipping Address
										</Typography>
										<Grid item xs={12} sm={6} textAlign={{ xs: "start", sm: "center" }}>
											<FormControl>
												<FormControlLabel
													disabled={
														(errors.billingDetails !== undefined &&
															errors.billingDetails !== null &&
															Object.keys(errors.billingDetails).length > 0) ||
														values?.billingDetails?.address === "" ||
														values.billingDetails?.city === "" ||
														values.billingDetails?.country_id === "" ||
														values.billingDetails?.state_id === "" ||
														values.billingDetails?.zip === ""
													}
													control={<Checkbox />}
													onClick={(e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
														const target = e.target as HTMLInputElement;
														if (target.checked) {
															setFieldValue("shippingDetails", values.billingDetails);
															return;
														}
														setFieldValue("shippingDetails", {
															address: "",
															city: "",
															country_id: "",
															state_id: "",
															zip: "",
														});
													}}
													label="Same as billing address"
												/>
											</FormControl>
										</Grid>
									</Grid>
									<Grid item xs={12}>
										<Grid container spacing={1}>
											<Grid item xs={12} sm={6}>
												<Field
													name="shippingDetails.country_id"
													component={AutocompleteField}
													label="Country"
													options={countryFindAll?.data?.map((item) => ({
														label: item.name,
														value: item.id,
													}))}
													loading={countryFindAll.isLoading}
													isRequired={true}
												/>
											</Grid>
											<Grid item xs={12} sm={6}>
												{/* <Field
											name="shippingDetails.state_id"
											component={AutocompleteField}
											label="State"
										/> */}
												<StateFormField
													countryFieldName="shippingDetails.country_id"
													stateFieldName="shippingDetails.state_id"
													stateLabel="State"
													isRequired={true}
												/>
											</Grid>
											<Grid item xs={12} sm={6}>
												<Field
													name="shippingDetails.city"
													component={TextFormField}
													label="City"
													isRequired={true}
												/>
												<Field
													name="shippingDetails.zip"
													component={TextFormField}
													label="Zip Code"
													isRequired={true}
												/>
											</Grid>
											<Grid item xs={12} sm={6}>
												<Field
													name="shippingDetails.address"
													component={TextFormField}
													label="Address"
													multiline
													rows={6}
													isRequired={true}
												/>
											</Grid>
										</Grid>
									</Grid>
									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											Save
										</Button>
									</Grid>
								</Box>
							</Form>
						);
					}}
				</Formik>
			</Box>
		</Box>
	);
};

export default CustomerForm;
