import { useCustomerControllerFindOne } from "@api/services/customer";
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import Loader from "@shared/components/Loader";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import CustomerDetails from "./CustomerDetails";

const CustomerView = ({
	open,
	handleClose,
	customerId,
}: {
	open: boolean;
	handleClose: () => void;
	customerId: string;
}) => {
	const { updateCustomer } = useCreateCustomerStore.getState();
	const { data, isLoading } = useCustomerControllerFindOne(customerId, {
		query: {
			enabled: !!customerId && customerId !== "",
		},
	});

	return (
		<Dialog open={open} onClose={handleClose} fullWidth>
			<AppDialogHeader title="Customer Details" handleClose={handleClose} />
			<DialogContent>
				{isLoading ? (
					<Loader />
				) : (
					<>
						<CustomerDetails data={data} />
					</>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} variant="outlined">
					Close
				</Button>
				<Button
					onClick={() => {
						if (!data) return;
						updateCustomer(data);
						handleClose();
					}}
					variant="contained"
				>
					Edit
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CustomerView;
