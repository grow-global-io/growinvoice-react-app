import { Box, Typography } from "@mui/material";
import { Field } from "formik";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useTranslation } from "react-i18next";

const CurrencyUpdateForm = () => {
	const { t } = useTranslation();
	const currencyList = useCurrencyControllerFindAll();

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
