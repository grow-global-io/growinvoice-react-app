import { Box, Button, Grid } from "@mui/material";
import { Formik, Field, Form, FormikHelpers } from "formik";
import * as yup from "yup";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useAuthStore } from "@store/auth";
import { useCurrencyControllerFindCountries } from "@api/services/currency";
import StateFormField from "@shared/components/FormFields/StateFormField";
import {
	getCompanyControllerFindOneQueryKey,
	useCompanyControllerFindOne,
	useCompanyControllerUpdate,
} from "@api/services/company";
import AvatarFormField from "@shared/components/FormFields/AvatarFormField";
import Loader from "@shared/components/Loader";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthControllerStatusQueryKey } from "@api/services/auth";
import { useTranslation } from "react-i18next";

const Company = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { user, refecthUser } = useAuthStore();
	const countryFindAll = useCurrencyControllerFindCountries();
	const companyUpdate = useCompanyControllerUpdate();
	const companyFindOne = useCompanyControllerFindOne(user?.company?.[0]?.id ?? "");

	const initialValues = {
		name: companyFindOne?.data?.name ?? "",
		phone: companyFindOne?.data?.phone ?? "",
		vat: companyFindOne?.data?.vat ?? "",
		country_id: companyFindOne?.data?.country_id ?? "",
		state_id: companyFindOne?.data?.state_id ?? "",
		city: companyFindOne?.data?.city ?? "",
		zip: companyFindOne?.data?.zip ?? "",
		address: companyFindOne?.data?.address ?? "",
		logo: companyFindOne?.data?.logo ?? "",
		user_id: user?.id ?? "",
	};
	const schema = yup.object().shape({
		name: yup
			.string()
			.required(t("settings.company.nameRequired", { defaultValue: "Company name is required" })),
		phone: yup
			.number()
			.required(t("settings.company.phoneRequired", { defaultValue: "Phone Number is required" })),
		vat: yup.string(),
		country_id: yup
			.string()
			.required(t("settings.company.countryRequired", { defaultValue: "Select Country" })),
		state_id: yup
			.string()
			.required(t("settings.company.stateRequired", { defaultValue: "Select state" })),
		city: yup
			.string()
			.required(t("settings.company.cityRequired", { defaultValue: "Select city" })),
		zip: yup
			.string()
			.required(t("settings.company.zipRequired", { defaultValue: "Postal Code is required" })),
		address: yup
			.string()
			.required(t("settings.company.addressRequired", { defaultValue: "Address is required" })),
		logo: yup.string(),
		user_id: yup
			.string()
			.required(t("settings.company.userIdRequired", { defaultValue: "user Id is required" })),
	});
	const handleSubmit = async (
		values: typeof initialValues,
		actions: FormikHelpers<typeof initialValues>,
	) => {
		await companyUpdate.mutateAsync({
			id: user?.company?.[0]?.id ?? "",
			data: values,
		});
		queryClient?.refetchQueries({
			queryKey: getCompanyControllerFindOneQueryKey(user?.company?.[0]?.id ?? ""),
		});
		queryClient.refetchQueries({
			queryKey: getAuthControllerStatusQueryKey(),
		});
		refecthUser();
		actions.resetForm();
	};

	if (companyFindOne.isLoading || companyFindOne?.isRefetching || companyFindOne?.isFetching)
		return <Loader />;

	return (
		<>
			<Box>
				<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
					{() => {
						return (
							<Form>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<Field
											name="logo"
											label={t("settings.company.logo", { defaultValue: "Logo" })}
											component={AvatarFormField}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="name"
											label={t("settings.company.name", { defaultValue: "Company Name" })}
											component={TextFormField}
											isRequired={true}
											placeholder={t("settings.company.namePlaceholder", {
												defaultValue: "Enter company name",
											})}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="phone"
											label={t("settings.company.phone", { defaultValue: "Phone" })}
											component={PhoneInputFormField}
											isRequired={true}
											placeholder={t("settings.company.phonePlaceholder", {
												defaultValue: "Enter mobile number",
											})}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="vat"
											label={t("settings.company.vat", { defaultValue: "VAT/GSTIN" })}
											component={TextFormField}
											placeholder={t("settings.company.vatPlaceholder", {
												defaultValue: "VAT Number",
											})}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="country_id"
											label={t("settings.company.country", { defaultValue: "Country" })}
											component={AutocompleteField}
											options={countryFindAll?.data?.map((item) => ({
												label: item.name,
												value: item.id,
											}))}
											loading={countryFindAll.isLoading}
											placeholder={t("app.select", { defaultValue: "Select" })}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<StateFormField
											countryFieldName="country_id"
											stateFieldName="state_id"
											stateLabel={t("settings.company.state", { defaultValue: "State" })}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="city"
											label={t("settings.company.city", { defaultValue: "City" })}
											component={TextFormField}
											isRequired={true}
											placeholder={t("app.select", { defaultValue: "Select" })}
										/>
									</Grid>

									<Grid item xs={12} sm={6}>
										<Field
											name="zip"
											label={t("settings.company.zip", { defaultValue: "Postal Code" })}
											component={TextFormField}
											isRequired={true}
											placeholder={t("settings.company.zipPlaceholder", {
												defaultValue: "Enter postal code",
											})}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="address"
											label={t("settings.company.address", { defaultValue: "Address" })}
											component={TextFormField}
											isRequired={true}
											placeholder={t("settings.company.addressPlaceholder", {
												defaultValue: "Add address",
											})}
											multiline
											rows={5}
										/>
									</Grid>

									<Grid item xs={12} textAlign={"center"} my={2}>
										<Button variant="contained" type="submit">
											{t("app.update", { defaultValue: "Update" })}
										</Button>
									</Grid>
								</Grid>
							</Form>
						);
					}}
				</Formik>
			</Box>
		</>
	);
};

export default Company;
