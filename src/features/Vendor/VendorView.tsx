import { useVendorsControllerFindOne } from "@api/services/vendors";
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import Loader from "@shared/components/Loader";
import { useCreateVendorsStore } from "@store/createVendorsStore";
import { useCreateVendorsViewStore } from "@store/createVendorViewStore";
import { useTranslation } from "react-i18next";
const VendorViewDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
	const { t } = useTranslation();
	const { updateVendors } = useCreateVendorsStore.getState();
	const { VendorId } = useCreateVendorsViewStore.getState();

	const { data, isLoading } = useVendorsControllerFindOne(VendorId ?? "", {
		query: {
			enabled: !!VendorId && VendorId !== "",
		},
	});
	return (
		<Dialog open={open} onClose={handleClose} fullWidth>
			<AppDialogHeader
				title={t("vendor.view.title", { defaultValue: "Vendor Details" })}
				handleClose={handleClose}
			/>
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
								<b>{t("vendor.view.name", { defaultValue: "Name:" })}</b> {data?.name}
							</Typography>
							<Typography variant="inherit">
								<b>{t("vendor.view.email", { defaultValue: "Email:" })}</b> {data?.email}
							</Typography>
							<Typography variant="inherit">
								<b>{t("vendor.view.phone", { defaultValue: "Phone:" })}</b> {data?.phone}
							</Typography>
							<Typography
								variant="h5"
								sx={{
									textDecoration: "underline",
								}}
							>
								{t("vendor.view.billingAddress", { defaultValue: "Billing Address:" })}
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
					{t("common.close", { defaultValue: "Close" })}
				</Button>
				<Button
					onClick={() => {
						if (!data) return;
						updateVendors(data?.id);
						handleClose();
					}}
					variant="contained"
				>
					{t("common.edit", { defaultValue: "Edit" })}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default VendorViewDialog;
