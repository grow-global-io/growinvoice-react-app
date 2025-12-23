import {
	Box,
	Typography,
	FormControlLabel,
	Radio,
	RadioGroup,
	FormControl,
	FormLabel,
} from "@mui/material";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	storeOrPaymentGateway?: "store" | "paymentGateway" | "both" | "none";
}

const StoreOrPaymentGatewayForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();

	return (
		<Box>
			<Typography variant="h3">
				{t("getStarted.storeOrPayment.title", {
					defaultValue: "Do you want a store feature or payment gateway?",
				})}
			</Typography>
			<Typography variant="h6" my={1} color={"secondary.dark"} fontWeight={500}>
				{t("getStarted.storeOrPayment.subtitle", {
					defaultValue: "Select the features you'd like to enable for your business.",
				})}
			</Typography>
			<Box mt={3}>
				<FormControl component="fieldset">
					<FormLabel component="legend" sx={{ mb: 2 }}>
						{t("getStarted.storeOrPayment.label", { defaultValue: "Select an option" })}
					</FormLabel>
					<RadioGroup
						value={values.storeOrPaymentGateway || "none"}
						onChange={(e) => {
							setFieldValue("storeOrPaymentGateway", e.target.value);
						}}
					>
						<FormControlLabel
							value="store"
							control={<Radio />}
							label={t("getStarted.storeOrPayment.store", { defaultValue: "Store Feature" })}
						/>
						<FormControlLabel
							value="paymentGateway"
							control={<Radio />}
							label={t("getStarted.storeOrPayment.paymentGateway", {
								defaultValue: "Payment Gateway",
							})}
						/>
						<FormControlLabel
							value="both"
							control={<Radio />}
							label={t("getStarted.storeOrPayment.both", {
								defaultValue: "Both Store Feature and Payment Gateway",
							})}
						/>
						<FormControlLabel
							value="none"
							control={<Radio />}
							label={t("getStarted.storeOrPayment.none", {
								defaultValue: "None (I'll set this up later)",
							})}
						/>
					</RadioGroup>
				</FormControl>
			</Box>
		</Box>
	);
};

export default StoreOrPaymentGatewayForm;
