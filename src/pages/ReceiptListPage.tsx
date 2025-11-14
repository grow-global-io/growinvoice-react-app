import InvoiceTablePaidList from "@features/Invoices/InvoiceTablePaidList";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AlertService } from "@shared/services/AlertService";

const ReceiptListPage = () => {
	const { t } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		// Show success message if we just created a receipt
		if (location.state?.showSuccessMessage) {
			// Small delay to ensure page is rendered
			setTimeout(() => {
				AlertService.instance.successMessage(
					t("receipt.successfullyCreated", { defaultValue: "Receipt Successfully Created" }),
				);
			}, 100);
			// Clear the state to prevent showing message on subsequent visits
			window.history.replaceState({}, document.title);
		}
	}, [location.state, t]);

	return (
		<>
			<Typography variant="h3" textTransform={"capitalize"} mb={2}>
				{t("receipt.title", { defaultValue: "Receipts" })}
			</Typography>
			<InvoiceTablePaidList />
		</>
	);
};

export default ReceiptListPage;
