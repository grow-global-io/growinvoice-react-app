import { Box, Grid, Typography } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import {
	useCurrencyControllerFindCountries,
	useCurrencyControllerFindStatesByCountry,
} from "@api/services/currency";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { UpdateCurrencyCompanyDto } from "@api/services/models";
import { FileUploadFormField } from "@shared/components/FormFields/FileUploadFormField";

const CompanyUpdateForm = () => {
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
			<Typography variant="h3">Tell us about your company</Typography>
			<Typography variant="h6" color={"secondary.dark"} fontWeight={500}>
				Provide some basic company details to get started.
			</Typography>
			<Grid container spacing={1} mt={2}>
				<Grid item xs={12} sm={6}>
					<Field
						name="companyName"
						label="Company Name"
						component={TextFormField}
						isRequired={true}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field name="phoneNumber" label="Phone Number" component={PhoneInputFormField} />
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="country"
						label="Country"
						component={AutocompleteField}
						options={countryFindAll?.data?.map((item) => ({ label: item.name, value: item.id }))}
						loading={countryFindAll.isLoading}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field
						name="state"
						label="State"
						component={AutocompleteField}
						options={statesFindAllByCountry?.data?.map((item) => ({
							label: item.name,
							value: item.id,
						}))}
						loading={statesFindAllByCountry.isLoading}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field name="city" label="City" component={TextFormField} />
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field name="zipCode" label="Zip Code" component={TextFormField} />
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field name="address" label="Address" component={TextFormField} multiline rows={3} />
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field name="vat" label="VAT" component={TextFormField} />
				</Grid>
				<Grid item xs={12} sm={6}>
					<Field name="logo" label="Logo" component={FileUploadFormField} />
				</Grid>
			</Grid>
		</Box>
	);
};

export default CompanyUpdateForm;
