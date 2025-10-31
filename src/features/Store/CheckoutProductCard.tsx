import React, { useMemo } from "react";
import { ProductWithAllDataDto } from "../../api/services/auth/models";
import { Card, CardActions, CardContent, IconButton, Typography, Box, Grid } from "@mui/material";
import { formatCurrency } from "../../shared/formatter";
import { useProductCheckoutStore } from "../../store/productCheckoutStore";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslation } from "react-i18next";

const CheckoutProductCard = ({
	product,
	quantity,
}: {
	product: ProductWithAllDataDto & {
		quantity: number;
		totalPrice: number; // Optional, can be calculated based on quantity and price
	};
	quantity: number;
}) => {
	const { t } = useTranslation();
	const { currencyCode, removeProductFromCheckout, changeQuantity } = useProductCheckoutStore();
	const priceBook = useMemo(() => {
		if (!product) return null;

		return product.priceBook?.find((price) => price.currency?.short_code === currencyCode) || null;
	}, [product, currencyCode]);

	// Calculate tax amount based on the price book and product tax
	const taxPercentage = useMemo(() => {
		if (!priceBook || !product?.tax) return 0;
		return product.tax.reduce((acc, tax) => acc + (tax?.tax?.percentage ?? 0), 0);
	}, [priceBook, product]);

	const taxAmount = useMemo(() => {
		if (!priceBook || !product?.tax) return 0;
		return (priceBook.price * taxPercentage) / 100;
	}, [priceBook, product, taxPercentage]);

	return (
		<Card>
			<CardContent
				sx={{
					padding: 2,
				}}
			>
				<Grid container spacing={2} alignItems="center">
					<Grid item xs={12} sm={6}>
						<Box>
							<Typography variant="h6" sx={{ textTransform: "capitalize" }}>
								{product.name}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{product.description ||
									t("store.product.noDescription", { defaultValue: "No description available." })}
							</Typography>
							<Typography variant="h6" color="primary" sx={{ marginTop: 1 }}>
								{t("store.product.price", { defaultValue: "Price:" })}{" "}
								{formatCurrency(priceBook?.price || 0, priceBook?.currency?.short_code || "INR")}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{t("store.cart.tax", { defaultValue: "Tax" })} ({taxPercentage}%):{" "}
								{formatCurrency(taxAmount, priceBook?.currency?.short_code || "INR")}
							</Typography>
						</Box>
					</Grid>
					<Grid item xs={12} sm={4}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							{/* decrement quantity */}
							<IconButton
								onClick={() => {
									changeQuantity(product.id, quantity - 1);
								}}
								disabled={quantity <= 1}
							>
								<RemoveIcon />
							</IconButton>
							<Typography variant="body2">
								{t("store.cart.quantity", { defaultValue: "Quantity:" })} {quantity}
							</Typography>
							<IconButton
								onClick={() => {
									changeQuantity(product.id, quantity + 1);
								}}
							>
								<AddIcon />
							</IconButton>
						</Box>
					</Grid>
					<Grid item xs={12} sm={2}>
						<Box>
							<Typography variant="body2">
								{t("store.cart.total", { defaultValue: "Total:" })}{" "}
								<strong>
									{formatCurrency(product?.totalPrice, priceBook?.currency?.short_code || "INR")}
								</strong>
							</Typography>
						</Box>
					</Grid>
				</Grid>
			</CardContent>
			<CardActions sx={{ justifyContent: "flex-end" }}>
				<CustomIconButton
					src={DeleteIcon}
					buttonType="delete"
					iconColor="error"
					onClick={() => removeProductFromCheckout(product.id)}
				/>
			</CardActions>
		</Card>
	);
};

export default CheckoutProductCard;
