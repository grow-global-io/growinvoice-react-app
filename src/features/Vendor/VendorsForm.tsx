import { useCreateVendorsStore } from "@store/createVendorsStore";
import { Box, Button, Divider, Grid, IconButton, Typography } from "@mui/material";
import { Formik, Form, Field, FormikHelpers } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import { Constants } from "@shared/constants";
import StateFormField from "@shared/components/FormFields/StateFormField";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useCurrencyControllerFindCountries } from "@api/services/currency";
import * as yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useAuthStore } from "@store/auth";
import { CreateVendorsWithAddressDto } from "@api/services/models";
import { RegexExp } from "@shared/regex";
import {
	getVendorsControllerFindAllQueryKey,
	getVendorsControllerFindOneQueryKey,
	useVendorsControllerCreate,
	useVendorsControllerFindOne,
	useVendorsControllerUpdate,
} from "@api/services/vendors";
import Loader from "@shared/components/Loader";
import { useQueryClient } from "@tanstack/react-query";
const VendorsForm = () => {
	const { user } = useAuthStore();
	const { setOpenVendorsForm, editVendorId } = useCreateVendorsStore.getState();
	const editValues = useVendorsControllerFindOne(editVendorId ?? "", {
		query: {
			enabled: editVendorId !== null,
		},
	});
	const queryClient = useQueryClient();
	const countryFindAll = useCurrencyControllerFindCountries();
	const initialValues: CreateVendorsWithAddressDto = {
		name: editValues?.data?.name ?? "",
		display_name: editValues?.data?.display_name ?? "",
		email: editValues?.data?.email ?? "",
		phone: editValues?.data?.phone ?? "",
		website: editValues?.data?.website ?? "",
		user_id: user?.id ?? "",
		billingAddress: {
			address: editValues?.data?.billingAddress?.address ?? "",
			city: editValues?.data?.billingAddress?.city ?? "",
			country_id: editValues?.data?.billingAddress?.country_id ?? "",
			state_id: editValues?.data?.billingAddress?.state_id ?? "",
			zip: editValues?.data?.billingAddress?.zip ?? "",
		},
	};
	const schema: yup.Schema<CreateVendorsWithAddressDto> = yup.object({
		name: yup
			.string()
			.required("Name is required")
			.matches(RegexExp.fullNameRegex, "Name is invalid"),
		display_name: yup.string().required("Display Name is required"),
		email: yup.string().required("Email is required").email("Email is invalid"),
		phone: yup.string().test("is-phone", "Phone number is not valid", function (value) {
			if (!value) return true;
			return isValidPhoneNumber(value);
		}),
		website: yup.string().matches(RegexExp.linkRegex, "Website is invalid"),
		user_id: yup.string().required("User is required"),
		billingAddress: yup.object().shape({
			address: yup.string().required("Address is required"),
			city: yup.string().required("City is required"),
			country_id: yup.string().required("Country is required"),
			state_id: yup.string().required("State is required"),
			zip: yup.string().required("Zip is required"),
		}),
	});
	const createVendors = useVendorsControllerCreate();
	const updateVendors = useVendorsControllerUpdate();
	const handleSubmit = async (
		values: CreateVendorsWithAddressDto,
		actions: FormikHelpers<CreateVendorsWithAddressDto>,
	) => {
		actions.setSubmitting(true);
		if (editVendorId !== null) {
			await updateVendors.mutateAsync({
				id: editVendorId ?? "",
				data: values,
			});
			queryClient.invalidateQueries({
				queryKey: getVendorsControllerFindOneQueryKey(editVendorId ?? ""),
			});
		} else {
			await createVendors.mutateAsync({
				data: values,
			});
		}
		queryClient.invalidateQueries({
			queryKey: getVendorsControllerFindAllQueryKey(),
		});
		if (editVendorId) {
			await queryClient?.refetchQueries({
				queryKey: getVendorsControllerFindOneQueryKey(editVendorId ?? ""),
			});
		}
		actions.resetForm();
		setOpenVendorsForm(false);
		actions.setSubmitting(false);
	};

	if (
		countryFindAll.isLoading ||
		(editVendorId && (editValues?.isLoading || editValues?.isRefetching))
	)
		return <Loader />;

	return (
		<>
			<Box sx={{ width: { lg: "700px" } }} role="presentation">
				<Grid container justifyContent={"space-between"} p={2}>
					<Typography
						variant="h4"
						fontWeight={"500"}
						textTransform={"capitalize"}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}
					>
						<PersonOutlineOutlinedIcon /> Add New Vendor
					</Typography>

					<IconButton
						sx={{
							color: "secondary.dark",
						}}
						onClick={() => setOpenVendorsForm(false)}
					>
						<CloseIcon />
					</IconButton>
				</Grid>

				<Box sx={{ mb: 2, mt: 2 }}>
					<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
						{() => (
							<Form>
								<Divider />
								<Grid container spacing={2} bgcolor={"custom.lightgray"} padding={2}>
									<Grid item xs={12} md={6}>
										<Field name="name" label="Contact Name" component={TextFormField} />
									</Grid>
									<Grid item xs={12} md={6}>
										<Field name="display_name" label="Display Name" component={TextFormField} />
									</Grid>
									<Grid item xs={12} md={6}>
										<Field name="email" label="Email" component={TextFormField} />
									</Grid>

									<Grid item xs={12} md={6}>
										<Field name="phone" label="Phone" component={PhoneInputFormField} />
									</Grid>
									<Grid item xs={12} md={6}>
										<Field name="website" label="Website" component={TextFormField} />
									</Grid>
								</Grid>
								<Grid container spacing={2} padding={2}>
									<Grid item xs={12} md={12}>
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
													name="billingAddress.country_id"
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
												<StateFormField
													countryFieldName="billingAddress.country_id"
													stateFieldName="billingAddress.state_id"
													stateLabel="State"
													isRequired={true}
												/>
											</Grid>
											<Grid item xs={12} sm={6}>
												<Field
													name="billingAddress.city"
													component={TextFormField}
													label="City"
													isRequired={true}
												/>
												<Field
													name="billingAddress.zip"
													component={TextFormField}
													label="Pincode"
													isRequired={true}
												/>
											</Grid>
											<Grid item xs={12} sm={6}>
												<Field
													name="billingAddress.address"
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
								</Grid>
							</Form>
						)}
					</Formik>
				</Box>
			</Box>
		</>
	);
};

export default VendorsForm;
