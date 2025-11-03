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
import { useEffect, useRef } from "react";

const CompanyUpdateForm = ({
	onGeoLoadingChange,
}: {
	onGeoLoadingChange?: (loading: boolean) => void;
}) => {
	const { t } = useTranslation();
	const { values, setFieldValue } = useFormikContext<UpdateCurrencyCompanyDto>();
	const countryFindAll = useCurrencyControllerFindCountries();
	const statesFindAllByCountry = useCurrencyControllerFindStatesByCountry({
		countryId: values.country || "",
	});

	// Prefill from ipapi only once and only if fields empty
	const prefillDoneRef = useRef(false);
	const ipDataRef = useRef<{ region?: string; city?: string; postal?: string } | null>(null);

	useEffect(() => {
		if (prefillDoneRef.current) return;
		// Only when country list loaded and fields empty
		if (!countryFindAll?.data || countryFindAll.isLoading) return;
		const isEmpty = !values.country && !values.state && !values.city && !values.zipCode;
		if (!isEmpty) return;

		let cancelled = false;
		(async () => {
			try {
				onGeoLoadingChange?.(true);
				const res = await fetch("https://ipapi.co/json");
				const json = (await res.json()) as {
					country_name?: string;
					region?: string;
					city?: string;
					postal?: string;
				};
				if (cancelled) return;
				const countryName = (json?.country_name ?? "").toLowerCase();
				const matchCountry = countryFindAll.data.find((c) => c.name?.toLowerCase() === countryName);
				if (matchCountry) {
					setFieldValue("country", matchCountry.id, false);
					ipDataRef.current = {
						region: json?.region,
						city: json?.city,
						postal: json?.postal,
					};
				} else {
					// still set city/zip if available
					if (json?.city) setFieldValue("city", json.city, false);
					if (json?.postal) setFieldValue("zipCode", json.postal, false);
					prefillDoneRef.current = true;
					onGeoLoadingChange?.(false);
				}
			} catch {
				onGeoLoadingChange?.(false);
			}
		})();

		return () => {
			cancelled = true;
			onGeoLoadingChange?.(false);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [countryFindAll?.data, countryFindAll.isLoading]);

	// After states load for selected country, set state and other fields
	useEffect(() => {
		if (!ipDataRef.current) return;
		if (!statesFindAllByCountry?.data || statesFindAllByCountry.isLoading) return;
		const regionName = (ipDataRef.current.region ?? "").toLowerCase();
		const matchState = statesFindAllByCountry.data.find(
			(s) => s.name?.toLowerCase() === regionName,
		);
		if (matchState) setFieldValue("state", matchState.id, false);
		if (ipDataRef.current.city) setFieldValue("city", ipDataRef.current.city, false);
		if (ipDataRef.current.postal) setFieldValue("zipCode", ipDataRef.current.postal, false);
		prefillDoneRef.current = true;
		onGeoLoadingChange?.(false);
	}, [
		statesFindAllByCountry?.data,
		statesFindAllByCountry.isLoading,
		setFieldValue,
		onGeoLoadingChange,
	]);

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
