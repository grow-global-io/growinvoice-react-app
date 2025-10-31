import { Drawer, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CustomerForm from "./CustomerForm";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import { useTranslation } from "react-i18next";
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

	return (
		<>
			<Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCustomerForm(true)}>
				{t("customerForm.createNew")}
			</Button>
		</>
	);
}
