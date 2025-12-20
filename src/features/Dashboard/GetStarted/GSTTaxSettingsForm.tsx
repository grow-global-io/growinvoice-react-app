import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Switch,
	FormControlLabel,
	Alert,
} from "@mui/material";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalculateIcon from "@mui/icons-material/Calculate";
import InfoIcon from "@mui/icons-material/Info";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	gstRegistered?: boolean;
	enableHsnSac?: boolean;
	defaultTaxRate?: string;
}

const taxRates = [
	{ id: "0", label: "0% GST", value: 0 },
	{ id: "5", label: "5% GST", value: 5 },
	{ id: "12", label: "12% GST", value: 12 },
	{ id: "18", label: "18% GST", value: 18 },
	{ id: "28", label: "28% GST", value: 28 },
];

const GSTTaxSettingsForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();

	return (
		<Box>
			<Typography variant="h3" textAlign="center">
				{t("getStarted.gstTax.title", {
					defaultValue: "GST & Tax Settings",
				})}
			</Typography>
			<Typography variant="h6" my={2} color={"secondary.dark"} fontWeight={500} textAlign="center">
				{t("getStarted.gstTax.subtitle", {
					defaultValue: "Configure your tax compliance settings",
				})}
			</Typography>

			{/* GST Registered Business */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mt: 3,
					p: 2,
					border: 1,
					borderColor: "grey.300",
					borderRadius: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<CheckCircleIcon sx={{ fontSize: 32, color: "success.main" }} />
					<Box>
						<Typography variant="h6" fontWeight={600}>
							{t("getStarted.gstTax.gstRegistered", {
								defaultValue: "GST Registered Business",
							})}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{t("getStarted.gstTax.gstRegisteredDescription", {
								defaultValue: "Enable if you have a GST registration number",
							})}
						</Typography>
					</Box>
				</Box>
				<FormControlLabel
					control={
						<Switch
							checked={values.gstRegistered || false}
							onChange={(e) => setFieldValue("gstRegistered", e.target.checked)}
							color="primary"
						/>
					}
					label=""
				/>
			</Box>

			{/* Enable HSN/SAC Codes */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mt: 2,
					p: 2,
					border: 1,
					borderColor: "grey.300",
					borderRadius: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<CalculateIcon sx={{ fontSize: 32, color: "primary.main" }} />
					<Box>
						<Typography variant="h6" fontWeight={600}>
							{t("getStarted.gstTax.enableHsnSac", {
								defaultValue: "Enable HSN/SAC Codes",
							})}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{t("getStarted.gstTax.enableHsnSacDescription", {
								defaultValue: "Add tax classification codes to products",
							})}
						</Typography>
					</Box>
				</Box>
				<FormControlLabel
					control={
						<Switch
							checked={values.enableHsnSac || false}
							onChange={(e) => setFieldValue("enableHsnSac", e.target.checked)}
							color="primary"
						/>
					}
					label=""
				/>
			</Box>

			{/* Default Tax Rate */}
			<Box mt={4}>
				<Typography variant="h6" fontWeight={600} mb={1}>
					{t("getStarted.gstTax.defaultTaxRate", {
						defaultValue: "Default Tax Rate",
					})}
				</Typography>
				<Typography variant="body2" color="text.secondary" mb={2}>
					{t("getStarted.gstTax.defaultTaxRateDescription", {
						defaultValue: "You can set different rates per product later",
					})}
				</Typography>
				<Grid container spacing={2}>
					{taxRates.map((rate) => {
						const isSelected = values.defaultTaxRate === rate.id;
						return (
							<Grid item xs={6} sm={4} md={2.4} key={rate.id}>
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
									onClick={() => setFieldValue("defaultTaxRate", rate.id)}
								>
									<CardContent sx={{ textAlign: "center", p: 2 }}>
										<Typography variant="body1" fontWeight={600}>
											{rate.label}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			</Box>

			{/* Info Box */}
			<Alert
				icon={<InfoIcon />}
				severity="info"
				sx={{
					mt: 4,
					backgroundColor: "info.light",
					color: "info.contrastText",
					"& .MuiAlert-icon": {
						color: "info.main",
					},
				}}
			>
				<Typography variant="subtitle1" fontWeight={600} gutterBottom>
					{t("getStarted.gstTax.notGstRegisteredTitle", {
						defaultValue: "Not GST Registered?",
					})}
				</Typography>
				<Typography variant="body2">
					{t("getStarted.gstTax.notGstRegisteredDescription", {
						defaultValue:
							"You can still sell products. GST registration is required only if your annual turnover exceeds ₹40 lakhs (₹20 lakhs for special category states).",
					})}
				</Typography>
			</Alert>
		</Box>
	);
};

export default GSTTaxSettingsForm;
