import { useRef } from "react";
import { useCustomerCheckoutStore } from "../../store/customerCheckoutStore";
import { Drawer, Box, Typography, Button } from "@mui/material";
import * as Yup from "yup";
import { Field, Form, Formik, type FormikProps } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import { Constants } from "@shared/constants";
import { useCurrencyControllerFindCountries } from "@api/services/currency";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import StateFormField from "@shared/components/FormFields/StateFormField";
import { useProductCheckoutStore } from "@store/productCheckoutStore";
import { useStoreControllerCreateCheckoutInvoice } from "@api/services/store";
import { useTranslation } from "react-i18next";

const CustomerDetailsDrawer = ({
	userId,
	handleOpenInvoice,
}: {
	userId: string; // Assuming userId is passed as a prop
	handleOpenInvoice?: () => void; // Optional callback for handling invoice details
}) => {
	const { t } = useTranslation();
	const { open, setOpenCheckoutForm } = useCustomerCheckoutStore();
	const {
		setOpenCheckoutForm: setProductForm,
		checkoutProducts,
		currencyCode,
	} = useProductCheckoutStore();
	const initialValues = {
		name: "",
		email: "",
		phone: "",
		shippingDetails: {
			address: "",
			city: "",
			country_id: "",
			state_id: "",
			zip: "",
		},
	};
	const formikRef = useRef<FormikProps<typeof initialValues>>(null);
	const schema = Yup.object().shape({
		name: Yup.string().required(t("store.customer.validation.nameRequired")),
		email: Yup.string()
			.email(t("store.customer.validation.emailInvalid"))
			.required(t("store.customer.validation.emailRequired")),
		phone: Yup.string().required(t("store.customer.validation.phoneRequired")),
		shippingDetails: Yup.object().shape({
			address: Yup.string().required(t("store.customer.validation.addressRequired")),
			city: Yup.string().required(t("store.customer.validation.cityRequired")),
			country_id: Yup.string().required(t("store.customer.validation.countryRequired")),
			state_id: Yup.string().required(t("store.customer.validation.stateRequired")),
			zip: Yup.string().required(t("store.customer.validation.zipRequired")),
		}),
	});
	const countryFindAll = useCurrencyControllerFindCountries();
	const checkout = useStoreControllerCreateCheckoutInvoice();

	const handleSubmit = async (values: typeof initialValues) => {
		// Handle form submission logic here
		await checkout.mutateAsync({
			data: {
				currency: currencyCode || "INR", // Default to INR if no currency code is set
				email: values.email,
				name: values.name,
				phone: values.phone,
				products: checkoutProducts.map((product) => ({
					product_id: product.id,
					quantity: product.quantity,
					hsnId: product.hsnCode_id ?? "",
					price:
						product.priceBook?.find((price) => price.currency?.short_code === currencyCode)
							?.price || 0,
					taxes:
						product?.tax
							?.map((tax) => tax?.tax?.id ?? undefined)
							?.filter((id) => id !== undefined) || [],
					total: product.totalPrice || 0,
				})),
				shippingDetails: {
					address: values.shippingDetails.address,
					city: values.shippingDetails.city,
					country_id: values.shippingDetails.country_id,
					state_id: values.shippingDetails.state_id,
					zip: values.shippingDetails.zip,
				},
				user_id: userId,
			},
		});
		setOpenCheckoutForm(false);
		setProductForm(false);
		if (handleOpenInvoice) {
			handleOpenInvoice();
		}
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={() => setOpenCheckoutForm(false)}
			sx={{
				"& .MuiDrawer-paper": {
					maxWidth: 700,
					boxSizing: "border-box",
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					height: "100%", // Take up the full drawer height
				}}
			>
				<Typography variant="h6" sx={{ padding: 2, flexShrink: 0 }}>
					{t("store.customer.title", { defaultValue: "Customer Details" })}
				</Typography>
				{/* Add form fields for customer details here */}
				<Box sx={{ flexGrow: 1, overflowY: "auto", padding: "0 16px" }}>
					<Formik
						initialValues={initialValues}
						validationSchema={schema}
						onSubmit={handleSubmit}
						innerRef={formikRef}
					>
						{() => (
							<Form id="customer-details-form" style={{ margin: 0, padding: 0 }}>
								<Field
									name="name"
									label={t("store.customer.name")}
									component={TextFormField}
									isRequired={true}
								/>
								<Field
									name="email"
									label={t("store.customer.email")}
									component={TextFormField}
									isRequired={true}
								/>
								<Field
									name="phone"
									label={t("store.customer.phone")}
									component={PhoneInputFormField}
									isRequired={true}
								/>
								<Typography
									variant="h6"
									color={"secondary.dark"}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
									}}
								>
									<img
										src={Constants.customImages.BillingAddressIcon}
										alt={t("store.customer.iconAlt")}
									/>{" "}
									{t("store.customer.shippingAddress")}
								</Typography>
								<Field
									name="shippingDetails.country_id"
									label={t("store.customer.country")}
									options={countryFindAll?.data?.map((item) => ({
										label: item.name,
										value: item.id,
									}))}
									component={AutocompleteField}
									isRequired={true}
									loading={countryFindAll.isLoading}
								/>
								<StateFormField
									countryFieldName="shippingDetails.country_id"
									stateFieldName="shippingDetails.state_id"
									stateLabel={t("store.customer.state")}
									isRequired={true}
								/>
								<Field
									name="shippingDetails.city"
									component={TextFormField}
									label={t("store.customer.city")}
									isRequired={true}
								/>
								<Field
									name="shippingDetails.zip"
									component={TextFormField}
									label={t("store.customer.zip")}
									isRequired={true}
								/>
								<Field
									name="shippingDetails.address"
									component={TextFormField}
									label={t("store.customer.address")}
									multiline
									rows={6}
									isRequired={true}
								/>
							</Form>
						)}
					</Formik>
				</Box>
				<Box
					sx={{
						padding: 2,
						flexShrink: 0,
						borderTop: "1px solid", // Adds a nice separator
						borderColor: "divider",
					}}
				>
					<Typography variant="body2" sx={{ marginBottom: 2 }}>
						{t("store.customer.review", {
							defaultValue: "Please review your details before proceeding to payment.",
						})}
					</Typography>
					<Box sx={{ display: "flex" }}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								if (formikRef.current) {
									formikRef.current.submitForm();
								}
							}}
						>
							{t("store.customer.proceedToPayment", { defaultValue: "Proceed to Payment" })}
						</Button>
						<Button
							variant="outlined"
							color="error"
							onClick={() => {
								setOpenCheckoutForm(false);
								setProductForm(true);
							}}
							sx={{ marginRight: 1 }}
						>
							{t("store.customer.back", { defaultValue: "Back" })}
						</Button>
					</Box>
				</Box>
			</Box>
		</Drawer>
	);
};

export default CustomerDetailsDrawer;
