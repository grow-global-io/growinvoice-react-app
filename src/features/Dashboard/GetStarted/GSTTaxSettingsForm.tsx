import {
	Box,
	Typography,
	Switch,
	FormControlLabel,
	Alert,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Divider,
} from "@mui/material";
import { Field, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalculateIcon from "@mui/icons-material/Calculate";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useTaxcodeControllerFindAll } from "@api/services/tax-code";
import { useDialog } from "@shared/hooks/useDialog";
import CreateTaxes from "@features/ProductTaxes/CreateTaxes";
import { useQueryClient } from "@tanstack/react-query";
import { getTaxcodeControllerFindAllQueryKey } from "@api/services/tax-code";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	gstRegistered?: boolean;
	enableHsnSac?: boolean;
	defaultTaxRate?: string;
}

const GSTTaxSettingsForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();
	const taxCodes = useTaxcodeControllerFindAll();
	const queryClient = useQueryClient();
	const { handleClickOpen, handleClose, open } = useDialog();

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
					<Box sx={{ textAlign: "left" }}>
						<Typography variant="h6" fontWeight={600} textAlign="left">
							{t("getStarted.gstTax.gstRegistered", {
								defaultValue: "GST Registered Business",
							})}
						</Typography>
						<Typography variant="body2" color="text.secondary" textAlign="left">
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
					<Box sx={{ textAlign: "left" }}>
						<Typography variant="h6" fontWeight={600} textAlign="left">
							{t("getStarted.gstTax.enableHsnSac", {
								defaultValue: "Enable HSN/SAC Codes",
							})}
						</Typography>
						<Typography variant="body2" color="text.secondary" textAlign="left">
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
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
					<Typography variant="h6" fontWeight={600} textAlign="left">
						{t("getStarted.gstTax.defaultTaxRate", {
							defaultValue: "Default Tax Rate",
						})}
					</Typography>
					<Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleClickOpen}>
						{t("getStarted.gstTax.addTax", { defaultValue: "Add Tax" })}
					</Button>
				</Box>
				<Typography variant="body2" color="text.secondary" mb={2} textAlign="left">
					{t("getStarted.gstTax.defaultTaxRateDescription", {
						defaultValue: "You can set different rates per product later",
					})}
				</Typography>
				<Field
					name="defaultTaxRate"
					label={t("getStarted.gstTax.defaultTaxRateLabel", {
						defaultValue: "Select Default Tax Rate",
					})}
					component={AutocompleteField}
					options={
						taxCodes?.data?.map((tax) => ({
							label: `${tax.name} (${tax.percentage}%)`,
							value: tax.id,
						})) || []
					}
					loading={taxCodes.isLoading || taxCodes.isFetching}
					placeholder={t("getStarted.gstTax.defaultTaxRatePlaceholder", {
						defaultValue: "Select a tax rate",
					})}
				/>
			</Box>
			<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
				<DialogTitle>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Typography
							variant="h4"
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
							}}
						>
							<DescriptionOutlinedIcon /> {t("tax.form.title", { defaultValue: "New Tax" })}
						</Typography>
						<IconButton
							sx={{
								color: "secondary.dark",
							}}
							onClick={handleClose}
						>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<Divider />
				<DialogContent>
					<Box sx={{ mb: 2, mt: 2 }}>
						<CreateTaxes
							handleClose={() => {
								handleClose();
								// Refresh tax codes list after creating a new tax
								queryClient.refetchQueries({
									queryKey: getTaxcodeControllerFindAllQueryKey(),
								});
							}}
						/>
					</Box>
				</DialogContent>
			</Dialog>

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
