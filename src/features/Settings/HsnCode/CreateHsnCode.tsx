import { Button, Drawer } from "@mui/material";
import HsnCodeForm from "./HsnCodeForm";
import AddIcon from "@mui/icons-material/Add";
import { useCreateHsnCodeStore } from "@store/createHsnCodeStore";
import { useTranslation } from "react-i18next";

export const HsnCodeDrawer = ({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) => (
	<Drawer anchor="right" open={open} onClose={handleClose}>
		<HsnCodeForm />
	</Drawer>
);

const CreateHsnCode = () => {
	const { t } = useTranslation();
	const { setOpenHsnCodeForm } = useCreateHsnCodeStore.getState();

	return (
		<Button
			variant="contained"
			onClick={() => {
				setOpenHsnCodeForm(true);
			}}
			startIcon={<AddIcon />}
		>
			{t("hsn.createNew", { defaultValue: "Create New" })}
		</Button>
	);
};

export default CreateHsnCode;
