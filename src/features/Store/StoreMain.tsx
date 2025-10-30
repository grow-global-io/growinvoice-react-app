import { useStoreControllerGetStore } from "../../api/services/auth/store";
import Loader from "@shared/components/Loader";
import StoreNavbar from "./StoreNavbar";
import { Box, Dialog, DialogContent, Grid, Typography } from "@mui/material";
import ProductCard from "./ProductCard";
import { useProductCheckoutStore } from "@store/productCheckoutStore";
import CustomerDetailsDrawer from "./CustomerDetailsDrawer";
import { useDialog } from "@shared/hooks/useDialog";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import { AlertService } from "@shared/services/AlertService";
import { useTranslation } from "react-i18next";

const StoreMain = ({ userId }: { userId: string }) => {
	const { t } = useTranslation();
	const { currencyCode } = useProductCheckoutStore();
	const store = useStoreControllerGetStore({
		userId,
		currency: currencyCode || "INR", // Default to INR if no currency code is set
	});

	const { handleClickOpen, handleClose, open } = useDialog();

	const handleInvoiceDetails = () => {
		// Logic to handle invoice details can be added here
		AlertService.instance.successMessage(
			t("store.invoiceSent", { defaultValue: "Invoice Sent to your email" }),
		);
		handleClickOpen();
	};

	if (store.isLoading) {
		return <Loader />;
	}

	return (
		<StoreNavbar
			logo={
				store?.data?.company?.[0]?.logo === ""
					? undefined
					: (store?.data?.company?.[0]?.logo ?? undefined)
			}
		>
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
				<Typography variant="h4" sx={{ marginTop: 2 }}>
					{store?.data?.company?.[0]?.name || "Store"}
				</Typography>
				<Typography variant="subtitle1" sx={{ marginTop: 1 }}>
					{t("store.welcome", { defaultValue: "Welcome to the store!" })}
				</Typography>
			</Box>
			<Box sx={{ padding: 2 }}>
				<Grid container spacing={3}>
					{store?.data?.product?.map((product) => (
						<Grid item xs={12} sm={6} md={4} key={product.id}>
							<ProductCard product={product} />
						</Grid>
					))}
				</Grid>
			</Box>
			<CustomerDetailsDrawer
				userId={store?.data?.id ?? ""}
				handleOpenInvoice={handleInvoiceDetails}
			/>
			<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
				<AppDialogHeader
					title={t("store.invoiceDetails", { defaultValue: "Invoice Details" })}
					handleClose={handleClose}
				/>
				<DialogContent>
					<Box>
						<Typography variant="h6">Invoice sent to your email</Typography>
						{/* Add invoice details content here */}
						<Typography variant="body1">
							Thank you for your purchase! Your invoice has been sent to your email address. You can
							view and pay your invoice online.
						</Typography>
					</Box>
				</DialogContent>
			</Dialog>
		</StoreNavbar>
	);
};

//

export default StoreMain;
