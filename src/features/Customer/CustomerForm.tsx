import React from "react";
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
import { Formik, Field, Form, type FormikHelpers } from "formik";
import * as yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import {
	type CreateCustomerWithAddressDto,
	CreateCustomerWithAddressDtoOption,
} from "@api/services/models";
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
import { useAuthControllerStatus } from "@api/services/auth";
import { AlertService } from "@shared/services/AlertService";
// import { CheckBoxFormField } from "@shared/components/FormFields/CheckBoxFormField";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

type CustomerFormProps = CreateCustomerWithAddressDto & {
	isBillingAddressRequired?: boolean;
};

const CustomerForm = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const countryFindAll = useCurrencyControllerFindCountries();
	const createCustomer = useCustomerControllerCreate();
	const currencyList = useCurrencyControllerFindAll();
	const { user, isGetStartedDialogOpen } = useAuthStore();
	const updateCustomer = useCustomerControllerUpdate();
	const { data: userData, isLoading, isRefetching } = useAuthControllerStatus();

	const { setOpenCustomerForm, editValues } = useCreateCustomerStore.getState();
	const initialValues: CustomerFormProps = {
		currencies_id: editValues?.currencies_id ?? user?.currency_id ?? "",
		name: editValues?.name ?? "",
		option: editValues?.option ?? CreateCustomerWithAddressDtoOption.Individual,
		gstIn: editValues?.gstIn ?? "",
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
		isBillingAddressRequired: false,
	};

	const schema = yup.object({
		currencies_id: yup.string(),
		name: yup
			.string()
			.required(t("customerForm.validation.nameRequired"))
			.matches(RegexExp.fullNameRegex, t("customerForm.validation.nameInvalid")),
		option: yup
			.string()
			.required(t("customerForm.validation.optionRequired"))
			.oneOf(
				Object.values(CreateCustomerWithAddressDtoOption),
				t("customerForm.validation.invalidType"),
			),
		gstIn: yup.string().test("gst-in", t("customerForm.validation.gstInvalid"), function (value) {
			// check option is bussinesswithgst then validate gstIn
			if (this.parent.option === CreateCustomerWithAddressDtoOption.BusinessWithGST) {
				if (!value) return false; // if value is empty, skip validation
				return true;
			}
			return true; // if option is not BusinessWithGst, skip validation
		}),
		isBillingAddressRequired: yup.boolean(),
		user_id: yup.string().required(t("customerForm.validation.userRequired")),
		billingDetails: yup.object().shape({
			address: yup
				.string()
				.test("billing-address", t("customerForm.validation.addressRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
			city: yup
				.string()
				.test("billing-city", t("customerForm.validation.cityRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
			country_id: yup
				.string()
				.test("billing-country", t("customerForm.validation.countryRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
			state_id: yup
				.string()
				.test("billing-state", t("customerForm.validation.stateRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
			zip: yup
				.string()
				.test("billing-zip", t("customerForm.validation.zipRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
		}),
		shippingDetails: yup.object().shape({
			address: yup
				.string()
				.test("shipping-address", t("customerForm.validation.addressRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						// if billing address is required, shipping address is also required
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
			city: yup
				.string()
				.test("shipping-city", t("customerForm.validation.cityRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						// if billing address is required, shipping city is also required
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
			country_id: yup
				.string()
				.test("shipping-country", t("customerForm.validation.countryRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						// if billing address is required, shipping country is also required
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
			state_id: yup
				.string()
				.test("shipping-state", t("customerForm.validation.stateRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						// if billing address is required, shipping state is also required
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
			zip: yup
				.string()
				.test("shipping-zip", t("customerForm.validation.zipRequired"), function (value) {
					const { isBillingAddressRequired } = this.options.context as {
						isBillingAddressRequired: boolean;
					};
					if (isBillingAddressRequired) {
						// if billing address is required, shipping zip is also required
						return value !== undefined && value.trim() !== "";
					}
					return true;
				}),
		}),
		display_name: yup.string().required(t("customerForm.validation.displayNameRequired")),
		email: yup.string().email(t("customerForm.validation.emailInvalid")),
		phone: yup
			.string()
			.optional()
			.nullable()
			.test("is-phone", t("customerForm.validation.phoneInvalid"), function (value) {
				if (!value) return true;
				return isValidPhoneNumber(value);
			}),
		website: yup.string().matches(RegexExp.linkRegex, t("customerForm.validation.websiteInvalid")),
	});

	const handleSubmit = async (
		values: CustomerFormProps,
		actions: FormikHelpers<CustomerFormProps>,
	) => {
		if (isGetStartedDialogOpen()) {
			AlertService.instance.errorMessage(
				"Please complete the Get Started process before creating a product.",
			);
			return;
		}
		actions.setSubmitting(true);
		if (editValues !== null) {
			const valuesAny: any = {
				...values,
				billingDetails: values.isBillingAddressRequired ? values.billingDetails : undefined,
				shippingDetails: values.isBillingAddressRequired ? values.shippingDetails : undefined,
			};
			await updateCustomer.mutateAsync({
				id: editValues.id,
				data: valuesAny,
			});
			queryClient.invalidateQueries({
				queryKey: getCustomerControllerFindOneQueryKey(editValues?.id ?? ""),
			});
		} else {
			await createCustomer.mutateAsync({
				data: {
					...values,
					billingDetails: values.isBillingAddressRequired ? values.billingDetails : undefined,
					shippingDetails: values.isBillingAddressRequired ? values.shippingDetails : undefined,
				},
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

	if (countryFindAll.isLoading || currencyList.isLoading || isLoading || isRefetching)
		return <Loader />;

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
					<img src={Constants.customImages.CustomerImg} alt={t("customerForm.iconAlt")} />{" "}
					{t("customerForm.addNew")}
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
						// Automatically set isBillingAddressRequired to true when any billing address field changes
						useEffect(() => {
							const billingFields = [
								values.billingDetails?.address,
								values.billingDetails?.city,
								values.billingDetails?.country_id,
								values.billingDetails?.state_id,
								values.billingDetails?.zip,
							];

							const hasBillingData = billingFields.some(
								(field) => field && field.toString().trim() !== "",
							);

							if (hasBillingData && !values.isBillingAddressRequired) {
								setFieldValue("isBillingAddressRequired", true);
							}
						}, [
							values.billingDetails?.address,
							values.billingDetails?.city,
							values.billingDetails?.country_id,
							values.billingDetails?.state_id,
							values.billingDetails?.zip,
							values.isBillingAddressRequired,
							setFieldValue,
						]);

						return (
							<Form>
								<Divider />
								<Box padding={2}>
									<Grid container spacing={2} bgcolor={"custom.lightgray"}>
										<Grid item xs={12} sm={8}>
											<Field
												name="option"
												label={t("customerForm.customerType")}
												component={AutocompleteField}
												options={Object.values(CreateCustomerWithAddressDtoOption).map((value) => ({
													value,
													label:
														value === CreateCustomerWithAddressDtoOption.Freelancer
															? t("customerForm.type.freelancer", { defaultValue: "Freelancer" })
															: value === CreateCustomerWithAddressDtoOption.BusinessWithGST
																? t("customerForm.type.businessWithGST", {
																		defaultValue: "Business with GST",
																	})
																: t("customerForm.type.businessWithoutGST", {
																		defaultValue: "Business without GST",
																	}),
												}))}
												isRequired={true}
											/>
										</Grid>

										<Grid item xs={12} sm={6}>
											<Field
												name="name"
												label={t("customerForm.customerName")}
												component={TextFormField}
												isRequired={true}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Field
												name="display_name"
												label={t("customerForm.displayName")}
												component={TextFormField}
											/>
										</Grid>

										<Grid item xs={12} sm={6}>
											<Field
												name="email"
												label={t("customerForm.email")}
												component={TextFormField}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Field
												name="phone"
												label={t("customerForm.phone")}
												component={PhoneInputFormField}
												defaultCountry={userData?.company?.[0]?.country?.code ?? undefined}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Field
												name="website"
												label={t("customerForm.website")}
												component={TextFormField}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Field
												name="currencies_id"
												label={t("customerForm.currency")}
												loading={currencyList.isLoading || currencyList.isFetching}
												component={AutocompleteField}
												options={currencyList?.data?.map((currency) => ({
													value: currency.id,
													label: `${currency.short_code} - ${currency.name}`,
												}))}
											/>
										</Grid>
										{values.option === CreateCustomerWithAddressDtoOption.BusinessWithGST && (
											<Grid item xs={12} sm={6}>
												<Field
													name="gstIn"
													label={t("customerForm.gstNumber")}
													component={TextFormField}
													isRequired={true}
												/>
											</Grid>
										)}
									</Grid>
									<Grid container spacing={2} my={1}>
										<Grid item xs={12} sm={12}>
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
													<img
														src={Constants.customImages.BillingAddressIcon}
														alt={t("customerForm.iconAlt")}
													/>{" "}
													{t("customerForm.billingAddress")}
												</Typography>
												{/* Hidden field for isBillingAddressRequired - automatically managed */}
												<Field name="isBillingAddressRequired" component="input" type="hidden" />
											</Grid>
										</Grid>
										<Grid item xs={12}>
											<Grid container spacing={1}>
												<Grid item xs={12} sm={6}>
													<Field
														name="billingDetails.country_id"
														component={AutocompleteField}
														label={t("customerForm.country")}
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
														stateLabel={t("customerForm.state")}
														isRequired={true}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														name="billingDetails.city"
														component={TextFormField}
														label={t("customerForm.city")}
														isRequired={true}
													/>
													<Field
														name="billingDetails.zip"
														component={TextFormField}
														label={t("customerForm.zipCode")}
														isRequired={true}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														name="billingDetails.address"
														component={TextFormField}
														label={t("customerForm.address")}
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
											<img
												src={Constants.customImages.BillingAddressIcon}
												alt={t("customerForm.iconAlt")}
											/>{" "}
											{t("customerForm.shippingAddress")}
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
													label={t("customerForm.sameAsBilling")}
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
													label={t("customerForm.country")}
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
													stateLabel={t("customerForm.state")}
													isRequired={true}
												/>
											</Grid>
											<Grid item xs={12} sm={6}>
												<Field
													name="shippingDetails.city"
													component={TextFormField}
													label={t("customerForm.city")}
													isRequired={true}
												/>
												<Field
													name="shippingDetails.zip"
													component={TextFormField}
													label={t("customerForm.zipCode")}
													isRequired={true}
												/>
											</Grid>
											<Grid item xs={12} sm={6}>
												<Field
													name="shippingDetails.address"
													component={TextFormField}
													label={t("customerForm.address")}
													multiline
													rows={6}
													isRequired={true}
												/>
											</Grid>
										</Grid>
									</Grid>
									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											{t("customerForm.save")}
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
