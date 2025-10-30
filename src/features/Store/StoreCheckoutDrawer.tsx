import { Box, Button, Drawer, Grid, IconButton, Typography } from "@mui/material";
import { useProductCheckoutStore } from "@store/productCheckoutStore";
import CheckoutProductCard from "./CheckoutProductCard";
import { useCustomerCheckoutStore } from "@store/customerCheckoutStore";
import { formatCurrency } from "@shared/formatter";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

const StoreCheckoutDrawer = ({
	open,
	setOpenCheckoutForm,
}: {
	open: boolean;
	setOpenCheckoutForm: (open: boolean) => void;
}) => {
	const { t } = useTranslation();
	const { checkoutProducts, currencyCode } = useProductCheckoutStore();
	const { setOpenCheckoutForm: setCustomerForm } = useCustomerCheckoutStore();

	const totalPrice = checkoutProducts.reduce((total, product) => {
		return product?.totalPrice + total;
	}, 0);

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={() => setOpenCheckoutForm(false)}
			sx={{
				"& .MuiDrawer-paper": {
					maxWidth: 700,
					boxSizing: "border-box",
				},
			}}
		>
			{/* --- 1. Main Flex Container --- */}
			{/* This Box will control the layout of the entire drawer content */}
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					height: "100%", // Take up the full drawer height
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Typography variant="h6" sx={{ padding: 2, flexShrink: 0 }}>
						{t("store.checkout.title", { defaultValue: "Checkout Items" })}
					</Typography>
					<IconButton
						onClick={() => {
							setOpenCheckoutForm(false);
						}}
						sx={{ marginRight: 2 }}
					>
						<CloseIcon />
					</IconButton>
				</Box>

				{/* --- 2. Scrollable Content Area --- */}
				{/* This Box will grow to fill available space and handle scrolling */}
				<Box sx={{ flexGrow: 1, overflowY: "auto", padding: "0 16px" }}>
					{checkoutProducts.length > 0 ? (
						<Grid container spacing={2}>
							{checkoutProducts.map((product) => (
								<Grid item xs={12} key={product.id}>
									<CheckoutProductCard product={product} quantity={product.quantity} />
								</Grid>
							))}
						</Grid>
					) : (
						<Typography sx={{ padding: 2, textAlign: "center", color: "text.secondary" }}>
							{t("store.checkout.empty", { defaultValue: "Your cart is empty." })}
						</Typography>
					)}
				</Box>

				{/* --- 3. Fixed Footer Area --- */}
				{/* This Box is pushed to the bottom by the flex-grow element above */}
				<Box
					sx={{
						padding: 2,
						flexShrink: 0,
						borderTop: "1px solid", // Adds a nice separator
						borderColor: "divider",
					}}
				>
					<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
						<Typography variant="h6">
							{t("store.checkout.total", { defaultValue: "Total:" })}
						</Typography>
						<Typography variant="h6">{formatCurrency(totalPrice, currencyCode)}</Typography>
					</Box>
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							setOpenCheckoutForm(false);
							setCustomerForm(true);
						}}
						fullWidth
						disabled={checkoutProducts.length === 0}
					>
						{t("store.checkout.next", { defaultValue: "Proceed to Next Step" })}
					</Button>
				</Box>
			</Box>
		</Drawer>
	);
};

export default StoreCheckoutDrawer;
