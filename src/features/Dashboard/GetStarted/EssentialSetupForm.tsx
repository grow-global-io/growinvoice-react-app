import { Alert, Box, Chip, Grid, Typography } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import {
	useCurrencyControllerFindAll,
	useCurrencyControllerFindCountries,
	useCurrencyControllerFindStatesByCountry,
} from "@api/services/currency";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import BusinessIcon from "@mui/icons-material/Business";
import PaymentsIcon from "@mui/icons-material/Payments";
import PublicIcon from "@mui/icons-material/Public";
import PhoneIcon from "@mui/icons-material/Phone";

interface Props {
	onGeoLoadingChange?: (loading: boolean) => void;
	geoData?: {
		currency?: string;
		country_name?: string;
		region?: string;
		city?: string;
		postal?: string;
	};
}

const EssentialSetupForm = ({ onGeoLoadingChange, geoData }: Props) => {
	const { t } = useTranslation();
	const { values, setFieldValue } = useFormikContext<UpdateCurrencyCompanyDto>();
	const currencyList = useCurrencyControllerFindAll();
	const countryFindAll = useCurrencyControllerFindCountries();
	const statesFindAllByCountry = useCurrencyControllerFindStatesByCountry({
		countryId: values.country || "",
	});

	const [hasAutoFilled, setHasAutoFilled] = useState(false);
	const prefillDoneRef = useRef(false);

	// Auto-fill currency and country from IP/geoData
	useEffect(() => {
		if (prefillDoneRef.current) return;
		if (!currencyList.data || currencyList.isLoading) return;
		if (!countryFindAll.data || countryFindAll.isLoading) return;

		let cancelled = false;
		(async () => {
			try {
				let data = geoData;
				if (!data || !data.currency) {
					onGeoLoadingChange?.(true);
					const res = await fetch("https://ipapi.co/json");
					data = await res.json();
				}
				if (cancelled || !data) return;

				// Auto-fill currency if not set
				if (!values.currency_id && data.currency) {
					const code = data.currency.toUpperCase();
					const matchCur = currencyList.data.find(
						(c) => c.short_code?.toUpperCase() === code,
					);
					if (matchCur) {
						setFieldValue("currency_id", matchCur.id, false);
						setHasAutoFilled(true);
					}
				}

				// Auto-fill country if not set
				if (!values.country && data.country_name) {
					const cName = data.country_name.toLowerCase();
					const matchCountry = countryFindAll.data.find(
						(c) => c.name?.toLowerCase() === cName,
					);
					if (matchCountry) {
						setFieldValue("country", matchCountry.id, false);
						setHasAutoFilled(true);
					}
				}

				// Auto-fill city and zipCode if available and empty
				if (!values.city && data.city) {
					setFieldValue("city", data.city, false);
				}
				if (!values.zipCode && data.postal) {
					setFieldValue("zipCode", data.postal, false);
				}
			} catch {
				// Geolocation failed silently
			} finally {
				if (!cancelled) {
					onGeoLoadingChange?.(false);
					prefillDoneRef.current = true;
				}
			}
		})();

		return () => {
			cancelled = true;
			onGeoLoadingChange?.(false);
		};
	}, [
		currencyList.data,
		currencyList.isLoading,
		countryFindAll.data,
		countryFindAll.isLoading,
		geoData,
		values.currency_id,
		values.country,
		values.city,
		values.zipCode,
		setFieldValue,
		onGeoLoadingChange,
	]);

	// Match state when country states are loaded
	useEffect(() => {
		if (!geoData?.region || !statesFindAllByCountry.data || statesFindAllByCountry.isLoading) return;
		if (values.state) return;

		const regionLower = geoData.region.toLowerCase();
		const matchState = statesFindAllByCountry.data.find(
			(s) => s.name?.toLowerCase() === regionLower,
		);
		if (matchState) {
			setFieldValue("state", matchState.id, false);
		}
	}, [statesFindAllByCountry.data, statesFindAllByCountry.isLoading, geoData, values.state, setFieldValue]);

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb={1} flexWrap="wrap" gap={1}>
				<Box>
					<Typography variant="h5" fontWeight={700} color="text.primary">
						{t("getStarted.essential.title", { defaultValue: "Step 1: Essential Business Profile" })}
					</Typography>
					<Typography variant="body2" color="text.secondary" mt={0.5}>
						{t("getStarted.essential.subtitle", {
							defaultValue: "Only business name & default currency are required. Everything else can be added later.",
						})}
					</Typography>
				</Box>
				{hasAutoFilled && (
					<Chip
						icon={<PublicIcon sx={{ fontSize: "14px !important", color: "text.secondary" }} />}
						label={t("getStarted.autoFilled", { defaultValue: "Location auto-detected" })}
						size="small"
						variant="outlined"
						sx={{ fontWeight: 500, fontSize: "0.75rem", bgcolor: "grey.50" }}
					/>
				)}
			</Box>

			<Grid container spacing={2} mt={1}>
				{/* Business Name (Required) */}
				<Grid item xs={12}>
					<Box display="flex" alignItems="center" gap={1} mb={0.5}>
						<BusinessIcon fontSize="small" color="primary" />
						<Typography variant="subtitle2" fontWeight={600}>
							{t("getStarted.company.companyName", { defaultValue: "Business / Company Name" })}{" "}
							<Typography component="span" color="error.main" fontWeight={700}>*</Typography>
						</Typography>
					</Box>
					<Field
						name="companyName"
						placeholder={t("getStarted.company.companyNamePlaceholder", {
							defaultValue: "e.g. Acme Studio or John Doe Freelancing",
						})}
						component={TextFormField}
						isRequired={true}
					/>
				</Grid>

				{/* Currency (Required) */}
				<Grid item xs={12} sm={6}>
					<Box display="flex" alignItems="center" gap={1} mb={0.5}>
						<PaymentsIcon fontSize="small" color="primary" />
						<Typography variant="subtitle2" fontWeight={600}>
							{t("getStarted.currency.label", { defaultValue: "Default Currency" })}{" "}
							<Typography component="span" color="error.main" fontWeight={700}>*</Typography>
						</Typography>
					</Box>
					<Field
						name="currency_id"
						loading={currencyList.isLoading || currencyList.isFetching}
						component={AutocompleteField}
						options={currencyList?.data?.map((currency) => ({
							value: currency.id,
							label: `${currency.short_code} - ${currency.name}`,
						}))}
						isRequired={true}
					/>
				</Grid>

				{/* Country (Optional / Pre-filled) */}
				<Grid item xs={12} sm={6}>
					<Box display="flex" alignItems="center" gap={1} mb={0.5}>
						<PublicIcon fontSize="small" color="primary" />
						<Typography variant="subtitle2" fontWeight={600}>
							{t("getStarted.company.country", { defaultValue: "Country" })}
							<Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
								(Optional)
							</Typography>
						</Typography>
					</Box>
					<Field
						name="country"
						placeholder={t("getStarted.company.countryPlaceholder", { defaultValue: "Select Country" })}
						component={AutocompleteField}
						options={countryFindAll?.data?.map((item) => ({ label: item.name, value: item.id }))}
						loading={countryFindAll.isLoading}
					/>
				</Grid>

				{/* State (Optional / Pre-filled) */}
				<Grid item xs={12} sm={6}>
					<Typography variant="subtitle2" fontWeight={600} mb={0.5}>
						{t("getStarted.company.state", { defaultValue: "State / Province" })}
						<Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
							(Optional)
						</Typography>
					</Typography>
					<Field
						name="state"
						placeholder={t("getStarted.company.statePlaceholder", { defaultValue: "Select State / Province" })}
						component={AutocompleteField}
						options={statesFindAllByCountry?.data?.map((item) => ({
							label: item.name,
							value: item.id,
						}))}
						loading={statesFindAllByCountry.isLoading}
					/>
				</Grid>

				{/* Phone Number (Optional) */}
				<Grid item xs={12} sm={6}>
					<Box display="flex" alignItems="center" gap={1} mb={0.5}>
						<PhoneIcon fontSize="small" color="action" />
						<Typography variant="subtitle2" fontWeight={600}>
							{t("getStarted.company.phoneNumber", { defaultValue: "Phone Number" })}
							<Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
								(Optional)
							</Typography>
						</Typography>
					</Box>
					<Field
						name="phoneNumber"
						component={PhoneInputFormField}
					/>
				</Grid>
			</Grid>

			<Alert
				severity="info"
				sx={{
					mt: 2,
					borderRadius: 2,
					py: 0.75,
					px: 1.5,
					"& .MuiAlert-message": { fontSize: "0.825rem", lineHeight: 1.45 },
				}}
			>
				{t("getStarted.essential.tip", {
					defaultValue:
						"You can click 'Save & Start Invoicing' below to begin creating your first invoice immediately. Additional details can be configured anytime in Settings.",
				})}
			</Alert>
		</Box>
	);
};

export default EssentialSetupForm;
