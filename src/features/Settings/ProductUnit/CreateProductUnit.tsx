import { Button, Drawer } from "@mui/material";
import ProductUnitForm from "./ProductUnitForm";
import AddIcon from "@mui/icons-material/Add";
import { useCreateProductUnitStore } from "@store/createProductUnitStore";
import { useTranslation } from "react-i18next";

export const ProductUnitDrawer = ({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) => (
	<Drawer anchor="right" open={open} onClose={handleClose}>
		<ProductUnitForm />
	</Drawer>
);

const CreateProductUnit = () => {
	const { t } = useTranslation();
	const { setOpenProductUnitForm } = useCreateProductUnitStore.getState();

	return (
		<Button
			variant="contained"
			onClick={() => {
				setOpenProductUnitForm(true);
			}}
			startIcon={<AddIcon />}
		>
			{t("productUnit.createNew", { defaultValue: "Create New" })}
		</Button>
	);
};

export default CreateProductUnit;
