import { Button, Drawer } from "@mui/material";
import PaymentForm from "./PaymentForm";
import { useCreatePaymentStore } from "@store/createPaymentStore";
import AddIcon from "@mui/icons-material/Add";

export const PaymentDrawer = ({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) => (
	<Drawer anchor="right" open={open} onClose={handleClose}>
		<PaymentForm />
	</Drawer>
);

const CreatePayments = () => {
	const { setOpenPaymentForm } = useCreatePaymentStore.getState();
	return (
		<Button
			variant="contained"
			onClick={() => {
				setOpenPaymentForm(true);
			}}
			startIcon={<AddIcon />}
		>
			Create New Payment
		</Button>
	);
};

export default CreatePayments;
