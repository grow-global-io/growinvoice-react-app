import { Box, Grid, Typography, Alert, Chip } from "@mui/material";
import { Field } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useTranslation } from "react-i18next";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TuneIcon from "@mui/icons-material/Tune";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const InvoicingTaxForm = () => {
	const { t } = useTranslation();

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb={1} flexWrap="wrap" gap={1}>
				<Box>
					<Typography variant="h5" fontWeight={700} color="text.primary">
						{t("getStarted.tax.title", { defaultValue: "Step 2: Advanced Settings (Optional)" })}
					</Typography>
					<Typography variant="body2" color="text.secondary" mt={0.5}>
						{t("getStarted.tax.subtitle", {
							defaultValue: "Tax IDs, invoice prefix, and billing address. You can complete this now or skip and do it later.",
						})}
					</Typography>
				</Box>
				<Chip
					icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important", color: "success.main" }} />}
					label={t("getStarted.optionalAll", { defaultValue: "All Fields Optional" })}
					size="small"
					color="success"
					variant="outlined"
					sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: "success.50" }}
				/>
			</Box>

			<Grid container spacing={2} mt={0.5}>
				{/* Tax / VAT / GSTIN */}
				<Grid item xs={12} sm={6}>
					<Box display="flex" alignItems="center" gap={1} mb={0.5}>
						<ReceiptIcon fontSize="small" color="primary" />
						<Typography variant="subtitle2" fontWeight={600}>
							{t("getStarted.company.vat", { defaultValue: "Tax ID / VAT / GSTIN" })}
						</Typography>
					</Box>
					<Field
						name="vat"
						placeholder={t("getStarted.company.vatPlaceholder", { defaultValue: "e.g. US123456789 or GSTIN" })}
						component={TextFormField}
					/>
				</Grid>

				{/* Invoice Prefix */}
				<Grid item xs={12} sm={6}>
					<Box display="flex" alignItems="center" gap={1} mb={0.5}>
						<TuneIcon fontSize="small" color="primary" />
						<Typography variant="subtitle2" fontWeight={600}>
							{t("getStarted.invoicePrefix", { defaultValue: "Invoice Number Prefix" })}
						</Typography>
					</Box>
					<Field
						name="invoicePrefix"
						placeholder="INV-"
						component={TextFormField}
					/>
				</Grid>

				{/* City */}
				<Grid item xs={12} sm={6}>
					<Box display="flex" alignItems="center" gap={1} mb={0.5}>
						<LocationOnIcon fontSize="small" color="action" />
						<Typography variant="subtitle2" fontWeight={600}>
							{t("getStarted.company.city", { defaultValue: "City" })}
						</Typography>
					</Box>
					<Field
						name="city"
						placeholder={t("getStarted.company.cityPlaceholder", { defaultValue: "e.g. San Francisco" })}
						component={TextFormField}
					/>
				</Grid>

				{/* Zip Code */}
				<Grid item xs={12} sm={6}>
					<Typography variant="subtitle2" fontWeight={600} mb={0.5}>
						{t("getStarted.company.zipCode", { defaultValue: "Postal / Zip Code" })}
					</Typography>
					<Field
						name="zipCode"
						placeholder={t("getStarted.company.zipCodePlaceholder", { defaultValue: "e.g. 94103" })}
						component={TextFormField}
					/>
				</Grid>

				{/* Address */}
				<Grid item xs={12}>
					<Typography variant="subtitle2" fontWeight={600} mb={0.5}>
						{t("getStarted.company.address", { defaultValue: "Street Address" })}
					</Typography>
					<Field
						name="address"
						placeholder={t("getStarted.company.addressPlaceholder", { defaultValue: "123 Business Way, Suite 100" })}
						component={TextFormField}
						multiline
						rows={2}
					/>
				</Grid>
			</Grid>

			<Alert
				severity="info"
				sx={{
					mt: 2.5,
					borderRadius: 2,
					"& .MuiAlert-message": { fontSize: "0.825rem", lineHeight: 1.45 },
				}}
			>
				{t("getStarted.tax.hint", {
					defaultValue:
						"Payment gateways, bank accounts, company logo, digital signature, and QR codes can be configured anytime in Settings > Invoices.",
				})}
			</Alert>
		</Box>
	);
};

export default InvoicingTaxForm;
