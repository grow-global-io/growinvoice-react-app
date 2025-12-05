import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import AppDialogFooter from "@shared/components/Dialog/AppDialogFooter";
import { useTranslation } from "react-i18next";
import type { InvoiceWithAllDataDto } from "@api/services/models";
import { shippingFormTooltips } from "@shared/tooltips";

interface EditShippingDialogProps {
	open: boolean;
	onClose: () => void;
	invoice: InvoiceWithAllDataDto | null;
	onSave: (invoiceId: string, shippingStatus: string, shippingRefNumber: string) => Promise<void>;
}

const EditShippingDialog: React.FC<EditShippingDialogProps> = ({
	open,
	onClose,
	invoice,
	onSave,
}) => {
	const { t } = useTranslation();
	const [shippingStatus, setShippingStatus] = useState<string>("ToBeShipped");
	const [shippingRefNumber, setShippingRefNumber] = useState<string>("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (invoice) {
			// Extract shipping status from notes
			let status = "ToBeShipped";
			if (invoice.notes?.includes("SHIPPING_STATUS:")) {
				const match = invoice.notes.match(/SHIPPING_STATUS:(\w+)/);
				if (match) {
					status = match[1];
				}
			}
			setShippingStatus(status);

			// Extract shipping reference number from notes
			let refNumber = "";
			if (invoice.notes?.includes("SHIPPING_REF:")) {
				const match = invoice.notes.match(/SHIPPING_REF:([^\n]+)/);
				if (match) {
					refNumber = match[1].trim();
				}
			}
			setShippingRefNumber(refNumber);
		}
	}, [invoice, open]);

	// Validation: If status is "Shipped", reference number is required
	const isSaveDisabled = isSaving || (shippingStatus === "Shipped" && !shippingRefNumber.trim());

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!invoice) return;

		// Prevent submission if validation fails
		if (isSaveDisabled) return;

		setIsSaving(true);
		try {
			await onSave(invoice.id, shippingStatus, shippingRefNumber);
			onClose();
		} catch (error) {
			console.error("Failed to save shipping details:", error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<form onSubmit={handleSubmit}>
				<AppDialogHeader
					handleClose={onClose}
					title={t("orders.dialog.editShipping", { defaultValue: "Edit Shipping Details" })}
				/>
				<DialogContent>
					<FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
						<InputLabel
							sx={{
								overflow: "visible",
								whiteSpace: "nowrap",
								maxWidth: "none",
								width: "auto",
								minWidth: "fit-content",
							}}
						>
							<Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
								<Typography
									sx={{
										whiteSpace: "nowrap",
										overflow: "visible",
										maxWidth: "none",
										width: "auto",
										minWidth: "fit-content",
									}}
								>
									{t("orders.table.shippingStatus", { defaultValue: "Shipment Status" })}
								</Typography>
								<Tooltip
									title={
										<Box>
											<strong>{t(shippingFormTooltips.shippingStatus.titleKey)}</strong>
											<br />
											{t(shippingFormTooltips.shippingStatus.descriptionKey)}
										</Box>
									}
									arrow
									placement="top"
								>
									<InfoIcon
										sx={{
											fontSize: 18,
											color: "primary.main",
											cursor: "help",
											ml: 0.5,
											verticalAlign: "middle",
										}}
									/>
								</Tooltip>
							</Box>
						</InputLabel>
						<Select
							value={shippingStatus}
							onChange={(e) => setShippingStatus(e.target.value)}
							label={t("orders.table.shippingStatus", { defaultValue: "Shipment Status" })}
						>
							<MenuItem value="Shipped">
								{t("orders.table.shippingStatus.shipped", { defaultValue: "Shipped" })}
							</MenuItem>
							<MenuItem value="ToBeShipped">
								{t("orders.table.shippingStatus.toBeShipped", { defaultValue: "To be shipped" })}
							</MenuItem>
						</Select>
					</FormControl>
					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel
							shrink
							sx={{
								overflow: "visible",
								whiteSpace: "nowrap",
								maxWidth: "none",
								width: "auto",
								minWidth: "fit-content",
							}}
						>
							<Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
								<Typography
									sx={{
										whiteSpace: "nowrap",
										overflow: "visible",
										maxWidth: "none",
										width: "auto",
										minWidth: "fit-content",
									}}
								>
									{t("orders.table.shippingRefNumber", {
										defaultValue: "Shipping Reference Number",
									})}
								</Typography>
								<Tooltip
									title={
										<Box>
											<strong>{t(shippingFormTooltips.shippingRefNumber.titleKey)}</strong>
											<br />
											{t(shippingFormTooltips.shippingRefNumber.descriptionKey)}
										</Box>
									}
									arrow
									placement="top"
								>
									<InfoIcon
										sx={{
											fontSize: 18,
											color: "primary.main",
											cursor: "help",
											ml: 0.5,
											verticalAlign: "middle",
										}}
									/>
								</Tooltip>
							</Box>
						</InputLabel>
						<TextField
							fullWidth
							value={shippingRefNumber}
							onChange={(e) => setShippingRefNumber(e.target.value)}
							placeholder={t("orders.dialog.shippingRefPlaceholder", {
								defaultValue: "Enter shipping reference number",
							})}
							label={undefined}
							InputLabelProps={{
								shrink: true,
							}}
						/>
					</FormControl>
				</DialogContent>
				<AppDialogFooter onClickCancel={onClose} saveButtonDisabled={isSaveDisabled} />
			</form>
		</Dialog>
	);
};

export default EditShippingDialog;
