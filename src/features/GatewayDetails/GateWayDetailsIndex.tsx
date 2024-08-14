import { Button, Dialog, Grid, Typography } from "@mui/material";
import GateWayDetailsList from "./GateWayDetailsList";
import AddIcon from "@mui/icons-material/Add";
import GatewayDetailsForm from "./GatewayDetailsForm";
import { useDialog } from "@shared/hooks/useDialog";

export const GateWayDialog = ({
	open,
	handleClose,
	editId,
}: {
	open: boolean;
	handleClose: () => void;
	editId?: string;
}) => (
	<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
		<GatewayDetailsForm handleClose={handleClose} gatewayId={editId} />
	</Dialog>
);
const GateWayDetailsIndex = () => {
	const { handleClickOpen, handleClose, open } = useDialog();
	return (
		<>
			<Grid container spacing={2}>
				<Grid item xs={6} display="flex" alignItems={"center"}>
					<Typography variant="h4" mb={3}>
						Gateway Details
					</Typography>
				</Grid>
				<Grid item xs={6} display="flex" justifyContent="flex-end" alignItems={"center"}>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => {
							handleClickOpen();
						}}
					>
						Add Gateway Details
					</Button>
				</Grid>
				<Grid item xs={12}>
					<GateWayDetailsList />
				</Grid>
			</Grid>
			<GateWayDialog open={open} handleClose={handleClose} />
		</>
	);
};

export default GateWayDetailsIndex;
