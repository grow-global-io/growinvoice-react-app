import { Button, Drawer } from "@mui/material";
import VendorsForm from "./VendorsForm";
import { useCreateVendorsStore } from "@store/createVendorsStore";
import AddIcon from "@mui/icons-material/Add";

export const VendorsDrawer = ({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) => (
	<Drawer anchor="right" open={open} onClose={handleClose}>
		<VendorsForm />
	</Drawer>
);

const CreateVendors = () => {
	const { setOpenVendorsForm } = useCreateVendorsStore.getState();
	return (
		<Button
			variant="contained"
			onClick={() => {
				setOpenVendorsForm(true);
			}}
			startIcon={<AddIcon />}
		>
			Create New
		</Button>
	);
};

export default CreateVendors;
