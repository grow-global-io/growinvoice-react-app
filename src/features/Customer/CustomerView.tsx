import React from "react";
import { useCustomerControllerFindOne } from "@api/services/customer";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import Loader from "@shared/components/Loader";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import CustomerDetails from "./CustomerDetails";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface CustomerViewProps {
	open: boolean;
	handleClose: () => void;
	customerId: string;
}

const CustomerView: React.FC<CustomerViewProps> = ({ open, handleClose, customerId }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { updateCustomer } = useCreateCustomerStore.getState();
	const { data, isLoading } = useCustomerControllerFindOne(customerId, {
		query: {
			enabled: !!customerId && customerId !== "",
		},
	});

	const handleEdit = () => {
		if (!data) return;
		updateCustomer(data);
		handleClose();
	};

	const handleCreateInvoice = () => {
		if (!customerId) return;
		handleClose();
		navigate(`/invoice/createinvoice?customerId=${customerId}`);
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth>
			<AppDialogHeader
				title={t("customer.title", { defaultValue: "Customer Details" })}
				handleClose={handleClose}
			/>
			<DialogContent>
				{isLoading ? <Loader /> : data ? <CustomerDetails data={data} /> : null}
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} variant="outlined">
					{t("app.close", { defaultValue: "Close" })}
				</Button>
				<Button onClick={handleCreateInvoice} variant="contained" disabled={!data} color="primary">
					{t("customer.createInvoice", { defaultValue: "Create Invoice" })}
				</Button>
				<Button onClick={handleEdit} variant="contained" disabled={!data}>
					{t("app.edit", { defaultValue: "Edit" })}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CustomerView;
