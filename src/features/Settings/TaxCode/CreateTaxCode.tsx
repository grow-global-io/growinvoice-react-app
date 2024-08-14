import { Button, Drawer } from "@mui/material";
import TaxCodeForm from "./TaxCodeForm";
import AddIcon from "@mui/icons-material/Add";
import { useCreateTaxCodeStore } from "@store/createTaxCodeStore";

export const TaxCodeDrawer = ({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) => (
	<Drawer anchor="right" open={open} onClose={handleClose}>
		<TaxCodeForm />
	</Drawer>
);

const CreateTaxCode = () => {
	const { setOpenTaxCodeForm } = useCreateTaxCodeStore.getState();
	return (
		<Button
			variant="contained"
			onClick={() => {
				setOpenTaxCodeForm(true);
			}}
			startIcon={<AddIcon />}
		>
			Create New
		</Button>
	);
};

export default CreateTaxCode;
