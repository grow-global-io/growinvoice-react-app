import { useCreateVendorsStore } from "@store/createVendorsStore";
import { Box, Button, Divider, Grid, IconButton, Typography } from "@mui/material";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import { Constants } from "@shared/constants";
import StateFormField from "@shared/components/FormFields/StateFormField";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { FieldWithTooltip } from "@shared/components/FormFields/FieldWithTooltip";
import { vendorFormTooltips } from "@shared/tooltips";
import { useCurrencyControllerFindCountries } from "@api/services/currency";
import * as yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useAuthStore } from "@store/auth";
import { type CreateVendorsWithAddressDto } from "@api/services/models";
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
import { useTranslation } from "react-i18next";
const VendorsForm = () => {
	const { t } = useTranslation();
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
		name: yup.string().required(t("vendorForm.validation.nameRequired")),
		// .matches(RegexExp.fullNameRegex, t("vendorForm.validation.nameInvalid")),
		display_name: yup.string().required(t("vendorForm.validation.displayNameRequired")),
		email: yup
			.string()
			.required(t("vendorForm.validation.emailRequired"))
			.email(t("vendorForm.validation.emailInvalid")),
		phone: yup.string().test("is-phone", t("vendorForm.validation.phoneInvalid"), function (value) {
			if (!value) return true;
			return isValidPhoneNumber(value);
		}),
		website: yup.string().matches(RegexExp.linkRegex, t("vendorForm.validation.websiteInvalid")),
		user_id: yup.string().required(t("vendorForm.validation.userRequired")),
		billingAddress: yup.object().shape({
			address: yup.string().required(t("vendorForm.validation.addressRequired")),
			city: yup.string().required(t("vendorForm.validation.cityRequired")),
			country_id: yup.string().required(t("vendorForm.validation.countryRequired")),
			state_id: yup.string().required(t("vendorForm.validation.stateRequired")),
			zip: yup.string().required(t("vendorForm.validation.zipRequired")),
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
						<PersonOutlineOutlinedIcon />{" "}
						{t("vendorForm.addNew", { defaultValue: "Add New Vendor" })}
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
										<FieldWithTooltip
											tooltipTitle={t(vendorFormTooltips.name.titleKey)}
											tooltipDescription={t(vendorFormTooltips.name.descriptionKey)}
										>
											<Field
												name="name"
												label={t("vendorForm.contactName")}
												component={TextFormField}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12} md={6}>
										<FieldWithTooltip
											tooltipTitle={t(vendorFormTooltips.display_name.titleKey)}
											tooltipDescription={t(vendorFormTooltips.display_name.descriptionKey)}
										>
											<Field
												name="display_name"
												label={t("vendorForm.displayName")}
												component={TextFormField}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12} md={6}>
										<FieldWithTooltip
											tooltipTitle={t(vendorFormTooltips.email.titleKey)}
											tooltipDescription={t(vendorFormTooltips.email.descriptionKey)}
										>
											<Field name="email" label={t("vendorForm.email")} component={TextFormField} />
										</FieldWithTooltip>
									</Grid>

									<Grid item xs={12} md={6}>
										<FieldWithTooltip
											tooltipTitle={t(vendorFormTooltips.phone.titleKey)}
											tooltipDescription={t(vendorFormTooltips.phone.descriptionKey)}
										>
											<Field
												name="phone"
												label={t("vendorForm.phone")}
												component={PhoneInputFormField}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12} md={6}>
										<FieldWithTooltip
											tooltipTitle={t(vendorFormTooltips.website.titleKey)}
											tooltipDescription={t(vendorFormTooltips.website.descriptionKey)}
										>
											<Field
												name="website"
												label={t("vendorForm.website")}
												component={TextFormField}
											/>
										</FieldWithTooltip>
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
											<img
												src={Constants.customImages.BillingAddressIcon}
												alt={t("vendorForm.iconAlt")}
											/>{" "}
											{t("vendorForm.billingAddress")}
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Grid container spacing={1}>
											<Grid item xs={12} sm={6}>
												<FieldWithTooltip
													tooltipTitle={t(vendorFormTooltips.billingCountry.titleKey)}
													tooltipDescription={t(vendorFormTooltips.billingCountry.descriptionKey)}
												>
													<Field
														name="billingAddress.country_id"
														component={AutocompleteField}
														label={t("vendorForm.country")}
														options={countryFindAll?.data?.map((item) => ({
															label: item.name,
															value: item.id,
														}))}
														loading={countryFindAll.isLoading}
														isRequired={true}
													/>
												</FieldWithTooltip>
											</Grid>
											<Grid item xs={12} sm={6}>
												<FieldWithTooltip
													tooltipTitle={t(vendorFormTooltips.billingState.titleKey)}
													tooltipDescription={t(vendorFormTooltips.billingState.descriptionKey)}
												>
													<StateFormField
														countryFieldName="billingAddress.country_id"
														stateFieldName="billingAddress.state_id"
														stateLabel={t("vendorForm.state")}
														isRequired={true}
													/>
												</FieldWithTooltip>
											</Grid>
											<Grid item xs={12} sm={6}>
												<FieldWithTooltip
													tooltipTitle={t(vendorFormTooltips.billingCity.titleKey)}
													tooltipDescription={t(vendorFormTooltips.billingCity.descriptionKey)}
												>
													<Field
														name="billingAddress.city"
														component={TextFormField}
														label={t("vendorForm.city")}
														isRequired={true}
													/>
												</FieldWithTooltip>
												<FieldWithTooltip
													tooltipTitle={t(vendorFormTooltips.billingZip.titleKey)}
													tooltipDescription={t(vendorFormTooltips.billingZip.descriptionKey)}
												>
													<Field
														name="billingAddress.zip"
														component={TextFormField}
														label={t("vendorForm.pincode")}
														isRequired={true}
													/>
												</FieldWithTooltip>
											</Grid>
											<Grid item xs={12} sm={6}>
												<FieldWithTooltip
													tooltipTitle={t(vendorFormTooltips.billingAddress.titleKey)}
													tooltipDescription={t(vendorFormTooltips.billingAddress.descriptionKey)}
												>
													<Field
														name="billingAddress.address"
														component={TextFormField}
														label={t("vendorForm.address")}
														multiline
														rows={6}
														isRequired={true}
													/>
												</FieldWithTooltip>
											</Grid>
										</Grid>
									</Grid>
									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											{t("vendorForm.save")}
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
