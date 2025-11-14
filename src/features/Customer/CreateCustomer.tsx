import { Drawer, Button, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CustomerForm from "./CustomerForm";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
// import { useDialog } from "@shared/hooks/useDialog";

export const CustomerDrawer = ({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) => (
	<Drawer anchor="right" open={open} onClose={handleClose}>
		<CustomerForm />
	</Drawer>
);

export default function CreateCustomer() {
	const { setOpenCustomerForm } = useCreateCustomerStore.getState();
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Button
					variant="outlined"
					onClick={() => {
						// const link = document.createElement("a");
						// link.href = "/Template.xlsx"; // URL to the bulk upload template file
						// link.download = "Template.xlsx";
						// document.body.appendChild(link);
						// link.click();
						// document.body.removeChild(link);
						navigate("/customer/bulk-upload");
					}}
				>
					{t("customerForm.bulkUpload", {
						defaultValue: "Bulk Upload",
					})}
				</Button>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setOpenCustomerForm(true)}
				>
					{t("customerForm.createNew")}
				</Button>
			</Box>
		</>
	);
}
