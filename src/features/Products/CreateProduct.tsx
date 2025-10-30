import { Drawer, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ProductForm from "./ProductForm";
import { useCreateProductStore } from "@store/createProductStore";
import { useTranslation } from "react-i18next";

export const ProductDrawer = ({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) => (
	<Drawer anchor="right" open={open} onClose={handleClose}>
		<ProductForm />
	</Drawer>
);

export default function CreateProduct() {
	const { t } = useTranslation();
	const { setOpenProductForm } = useCreateProductStore.getState();
	return (
		<>
			<Button
				variant="contained"
				onClick={() => {
					setOpenProductForm(true);
				}}
				startIcon={<AddIcon />}
			>
				{t("product.createNew", { defaultValue: "Create New Product" })}
			</Button>
		</>
	);
}
