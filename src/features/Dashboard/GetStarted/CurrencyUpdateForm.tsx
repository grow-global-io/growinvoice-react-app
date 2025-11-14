import { Box, Typography } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";

const CurrencyUpdateForm = ({
	onGeoLoadingChange,
}: {
	onGeoLoadingChange?: (loading: boolean) => void;
}) => {
	const { t } = useTranslation();
	const currencyList = useCurrencyControllerFindAll();
	const { setFieldValue, values } = useFormikContext<UpdateCurrencyCompanyDto>();
	const hasPrefilled = useRef(false);

	useEffect(() => {
		if (hasPrefilled.current) return;
		if (values?.currency_id) return; // already chosen
		// Only run when options are loaded
		if (!currencyList?.data || currencyList.isLoading || currencyList.isFetching) return;

		let cancelled = false;
		(async () => {
			try {
				onGeoLoadingChange?.(true);
				const res = await fetch("https://ipapi.co/json");
				const json = (await res.json()) as { currency?: string };
				if (cancelled) return;
				const code = json?.currency?.toUpperCase();
				if (!code) return;
				const match = currencyList.data.find((c) => c.short_code?.toUpperCase() === code);
				if (match) {
					setFieldValue("currency_id", match.id, false);
					hasPrefilled.current = true;
				}
			} catch {
				// silent fail – leave empty if geolocation fails
			} finally {
				if (!cancelled) onGeoLoadingChange?.(false);
			}
		})();

		return () => {
			cancelled = true;
			onGeoLoadingChange?.(false);
		};
	}, [
		currencyList?.data,
		currencyList.isLoading,
		currencyList.isFetching,
		setFieldValue,
		values?.currency_id,
	]);

	return (
		<Box>
			<Typography variant="h3">
				{t("getStarted.currency.title", { defaultValue: "Choose Your Currency" })}
			</Typography>
			<Typography variant="h6" my={1} color={"secondary.dark"} fontWeight={500}>
				{t("getStarted.currency.help", {
					defaultValue:
						"We need to verify your email address to ensure you have access to the application.",
				})}
			</Typography>
			<Box>
				<Field
					name="currency_id"
					label={t("getStarted.currency.label", { defaultValue: "Currency" })}
					loading={currencyList.isLoading || currencyList.isFetching}
					component={AutocompleteField}
					options={currencyList?.data?.map((currency) => ({
						value: currency.id,
						label: `${currency.short_code} - ${currency.name}`,
					}))}
				/>
			</Box>
		</Box>
	);
};

export default CurrencyUpdateForm;
