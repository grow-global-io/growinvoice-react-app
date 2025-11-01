import { Box, Grid, Typography } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import {
	useCurrencyControllerFindCountries,
	useCurrencyControllerFindStatesByCountry,
} from "@api/services/currency";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { type UpdateCurrencyCompanyDto } from "@api/services/models";
import { FileUploadFormField } from "@shared/components/FormFields/FileUploadFormField";
import { useTranslation } from "react-i18next";

const CompanyUpdateForm = () => {
	const { t } = useTranslation();
	const {
		values,
	}: {
		values: UpdateCurrencyCompanyDto;
	} = useFormikContext();
	const countryFindAll = useCurrencyControllerFindCountries();
	const statesFindAllByCountry = useCurrencyControllerFindStatesByCountry({
		countryId: values.country || "",
	});

	return (
		<Box>
			<Typography variant="h3">
				{t("getStarted.company.title", { defaultValue: "Tell us about your company" })}
			</Typography>
			<Typography variant="h6" color={"secondary.dark"} fontWeight={500}>
				{t("getStarted.company.subtitle", {
					defaultValue: "Provide some basic company details to get started.",
				})}
			</Typography>
			<Grid container spacing={1} mt={2}>
				<Grid item xs={12} sm={6}>
					<Field
						name="companyName"
						label={t("getStarted.company.companyName", { defaultValue: "Company Name" })}
						component={TextFormField}
						isRequired={true}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="phoneNumber"
						label={t("getStarted.company.phoneNumber", { defaultValue: "Phone Number" })}
						component={PhoneInputFormField}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="country"
						label={t("getStarted.company.country", { defaultValue: "Country" })}
						component={AutocompleteField}
						options={countryFindAll?.data?.map((item) => ({ label: item.name, value: item.id }))}
						loading={countryFindAll.isLoading}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="state"
						label={t("getStarted.company.state", { defaultValue: "State" })}
						component={AutocompleteField}
						options={statesFindAllByCountry?.data?.map((item) => ({
							label: item.name,
							value: item.id,
						}))}
						loading={statesFindAllByCountry.isLoading}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="city"
						label={t("getStarted.company.city", { defaultValue: "City" })}
						component={TextFormField}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="zipCode"
						label={t("getStarted.company.zipCode", { defaultValue: "Zip Code" })}
						component={TextFormField}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="address"
						label={t("getStarted.company.address", { defaultValue: "Address" })}
						component={TextFormField}
						multiline
						rows={3}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="vat"
						label={t("getStarted.company.vat", { defaultValue: "VAT/GSTIN" })}
						component={TextFormField}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="logo"
						label={t("getStarted.company.logo", { defaultValue: "Logo" })}
						component={FileUploadFormField}
					/>
				</Grid>
			</Grid>
		</Box>
	);
};

export default CompanyUpdateForm;
