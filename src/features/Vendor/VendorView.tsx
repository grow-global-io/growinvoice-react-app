import { useVendorsControllerFindOne } from "@api/services/vendors";
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import Loader from "@shared/components/Loader";
import { useCreateVendorsStore } from "@store/createVendorsStore";
import { useCreateVendorsViewStore } from "@store/createVendorViewStore";
const VendorViewDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
	const { updateVendors } = useCreateVendorsStore.getState();
	const { VendorId } = useCreateVendorsViewStore.getState();

	const { data, isLoading } = useVendorsControllerFindOne(VendorId ?? "", {
		query: {
			enabled: !!VendorId && VendorId !== "",
		},
	});
	return (
		<Dialog open={open} onClose={handleClose} fullWidth>
			<AppDialogHeader title="Vendors Details" handleClose={handleClose} />
			<DialogContent>
				{isLoading ? (
					<Loader />
				) : (
					<>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: 2,
							}}
						>
							<Typography variant="inherit">
								<b>Name:</b> {data?.name}
							</Typography>
							<Typography variant="inherit">
								<b>Email:</b> {data?.email}
							</Typography>
							<Typography variant="inherit">
								<b>Phone:</b> {data?.phone}
							</Typography>
							<Typography
								variant="h5"
								sx={{
									textDecoration: "underline",
								}}
							>
								Billing Address:
							</Typography>
							<Typography variant="inherit">
								{data?.billingAddress?.address}, {data?.billingAddress?.city}
								{", "}
								{data?.billingAddress?.zip}
							</Typography>
						</Box>
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
						updateVendors(data?.id);
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

export default VendorViewDialog;
