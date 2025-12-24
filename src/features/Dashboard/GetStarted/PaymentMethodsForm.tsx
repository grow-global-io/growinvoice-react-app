import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Divider,
	Switch,
	FormControlLabel,
} from "@mui/material";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	paymentMethods?: string[];
	enablePartialPayments?: boolean;
}

const paymentOptions = [
	{
		id: "stripe",
		icon: CreditCardIcon,
		title: "Stripe",
		description: "Accept cards globally",
	},
	{
		id: "razorpay",
		icon: AccountBalanceIcon,
		title: "Razorpay",
		description: "Popular in India",
	},
	{
		id: "upi",
		icon: PhoneAndroidIcon,
		title: "UPI",
		description: "Instant bank transfers",
	},
	{
		id: "cod",
		icon: LocalAtmIcon,
		title: "Cash on Delivery",
		description: "Pay on delivery",
	},
];

const PaymentMethodsForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();
	const selectedPaymentMethods = values.paymentMethods || [];

	const handleTogglePaymentMethod = (methodId: string) => {
		const currentMethods = selectedPaymentMethods;
		if (currentMethods.includes(methodId)) {
			setFieldValue(
				"paymentMethods",
				currentMethods.filter((id) => id !== methodId),
			);
		} else {
			setFieldValue("paymentMethods", [...currentMethods, methodId]);
		}
	};

	return (
		<Box>
			<Typography variant="h3" textAlign="center">
				{t("getStarted.paymentMethods.title", {
					defaultValue: "Set up payment methods",
				})}
			</Typography>
			<Typography variant="h6" my={2} color={"secondary.dark"} fontWeight={500} textAlign="center">
				{t("getStarted.paymentMethods.subtitle", {
					defaultValue: "Choose how you want to accept payments",
				})}
			</Typography>
			<Grid container spacing={2} mt={1}>
				{paymentOptions.map((method) => {
					const Icon = method.icon;
					const isSelected = selectedPaymentMethods.includes(method.id);
					return (
						<Grid item xs={12} sm={6} key={method.id}>
							<Card
								sx={{
									cursor: "pointer",
									border: isSelected ? 2 : 1,
									borderColor: isSelected ? "primary.main" : "grey.300",
									boxShadow: isSelected ? 3 : 1,
									"&:hover": {
										borderColor: "primary.main",
										boxShadow: 3,
									},
									height: "100%",
								}}
								onClick={() => handleTogglePaymentMethod(method.id)}
							>
								<CardContent
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 2,
										p: 2,
									}}
								>
									<Icon
										sx={{
											fontSize: 32,
											color: isSelected ? "primary.main" : "grey.600",
										}}
									/>
									<Box sx={{ textAlign: "left" }}>
										<Typography variant="h6" fontWeight={600} textAlign="left">
											{method.title}
										</Typography>
										<Typography variant="body2" color="text.secondary" textAlign="left">
											{method.description}
										</Typography>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					);
				})}
			</Grid>
			<Divider sx={{ my: 3 }} />
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Box sx={{ textAlign: "left" }}>
					<Typography variant="h6" fontWeight={600} textAlign="left">
						{t("getStarted.paymentMethods.partialPayments", {
							defaultValue: "Enable partial payments",
						})}
					</Typography>
					<Typography variant="body2" color="text.secondary" textAlign="left">
						{t("getStarted.paymentMethods.partialPaymentsDescription", {
							defaultValue: "Allow customers to pay a deposit upfront",
						})}
					</Typography>
				</Box>
				<FormControlLabel
					control={
						<Switch
							checked={values.enablePartialPayments || false}
							onChange={(e) => setFieldValue("enablePartialPayments", e.target.checked)}
							color="primary"
						/>
					}
					label=""
				/>
			</Box>
		</Box>
	);
};

export default PaymentMethodsForm;
