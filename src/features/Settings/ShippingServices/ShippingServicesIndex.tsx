import { Button, Dialog, Grid, Typography } from "@mui/material";
import ShippingServicesList from "./ShippingServicesList";
import PickupAddressList from "./PickupAddressList";
import AddIcon from "@mui/icons-material/Add";
import ShippingServiceForm from "./ShippingServiceForm";
import PickupAddressForm from "./PickupAddressForm";
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

export const PickupAddressDialog = ({
	open,
	handleClose,
	addressId,
}: {
	open: boolean;
	handleClose: () => void;
	addressId?: string;
}) => (
	<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
		<PickupAddressForm handleClose={handleClose} addressId={addressId} />
	</Dialog>
);

const ShippingServicesIndex = () => {
	const { t } = useTranslation();
	const { handleClickOpen, handleClose, open } = useDialog();
	const {
		handleClickOpen: handlePickupClickOpen,
		handleClose: handlePickupClose,
		open: pickupOpen,
	} = useDialog();
	const [editId, setEditId] = useState<string | null>(null);
	const [pickupAddressId, setPickupAddressId] = useState<string | null>(null);

	const handleAddClick = () => {
		setEditId(null);
		handleClickOpen();
	};

	const handleEdit = (id: string) => {
		setEditId(id);
		handleClickOpen();
	};

	const handleAddPickupClick = () => {
		setPickupAddressId(null);
		handlePickupClickOpen();
	};

	const handleEditPickup = (id: string) => {
		setPickupAddressId(id);
		handlePickupClickOpen();
	};

	return (
		<>
			<Grid container spacing={2}>
				{/* Shipping Services Section */}
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

				{/* Pickup Address Section */}
				<Grid item xs={12} mt={4}>
					<Grid container spacing={2}>
						<Grid item xs={6} display="flex" alignItems={"center"}>
							<Typography variant="h4" mb={3}>
								{t("pickupAddress.title", { defaultValue: "Pickup Address" })}
							</Typography>
						</Grid>
						<Grid item xs={6} display="flex" justifyContent="flex-end" alignItems={"center"}>
							<Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPickupClick}>
								{t("pickupAddress.add", { defaultValue: "Add Pickup Address" })}
							</Button>
						</Grid>
						<Grid item xs={12}>
							<PickupAddressList onEdit={handleEditPickup} />
						</Grid>
					</Grid>
				</Grid>
			</Grid>
			<ShippingServiceDialog open={open} handleClose={handleClose} editId={editId ?? undefined} />
			<PickupAddressDialog
				open={pickupOpen}
				handleClose={handlePickupClose}
				addressId={pickupAddressId ?? undefined}
			/>
		</>
	);
};

export default ShippingServicesIndex;
