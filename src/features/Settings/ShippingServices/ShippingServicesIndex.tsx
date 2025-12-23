import { Button, Dialog, Grid, Typography } from "@mui/material";
import ShippingServicesList from "./ShippingServicesList";
import AddIcon from "@mui/icons-material/Add";
import ShippingServiceForm from "./ShippingServiceForm";
import { useDialog } from "@shared/hooks/useDialog";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export const ShippingServiceDialog = ({
	open,
	handleClose,
	editId,
}: {
	open: boolean;
	handleClose: () => void;
	editId?: string;
}) => (
	<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
		<ShippingServiceForm handleClose={handleClose} serviceId={editId} />
	</Dialog>
);

const ShippingServicesIndex = () => {
	const { t } = useTranslation();
	const { handleClickOpen, handleClose, open } = useDialog();
	const [editId, setEditId] = useState<string | null>(null);

	const handleAddClick = () => {
		setEditId(null);
		handleClickOpen();
	};

	const handleEdit = (id: string) => {
		setEditId(id);
		handleClickOpen();
	};

	return (
		<>
			<Grid container spacing={2}>
				<Grid item xs={6} display="flex" alignItems={"center"}>
					<Typography variant="h4" mb={3}>
						{t("shippingServices.title", { defaultValue: "Shipping Services" })}
					</Typography>
				</Grid>
				<Grid item xs={6} display="flex" justifyContent="flex-end" alignItems={"center"}>
					<Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
						{t("shippingServices.add", { defaultValue: "Add Shipping Service" })}
					</Button>
				</Grid>
				<Grid item xs={12}>
					<ShippingServicesList onEdit={handleEdit} />
				</Grid>
			</Grid>
			<ShippingServiceDialog open={open} handleClose={handleClose} editId={editId ?? undefined} />
		</>
	);
};

export default ShippingServicesIndex;
