import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import AppDialogFooter from "@shared/components/Dialog/AppDialogFooter";
import { useTranslation } from "react-i18next";
import type { InvoiceWithAllDataDto } from "@api/services/models";

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!invoice) return;

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
						<InputLabel>
							{t("orders.table.shippingStatus", { defaultValue: "Shipment Status" })}
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
					<TextField
						fullWidth
						label={t("orders.table.shippingRefNumber", {
							defaultValue: "Shipping Reference Number",
						})}
						value={shippingRefNumber}
						onChange={(e) => setShippingRefNumber(e.target.value)}
						placeholder={t("orders.dialog.shippingRefPlaceholder", {
							defaultValue: "Enter shipping reference number",
						})}
						sx={{ mb: 2 }}
					/>
				</DialogContent>
				<AppDialogFooter onClickCancel={onClose} saveButtonDisabled={isSaving} />
			</form>
		</Dialog>
	);
};

export default EditShippingDialog;
