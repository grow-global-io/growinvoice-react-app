import React, { useMemo } from "react";
import { ProductWithAllDataDto } from "../../api/services/auth/models";
import { Card, CardActions, CardContent, IconButton, Typography, Box } from "@mui/material";
import { formatCurrency } from "../../shared/formatter";
import { useProductCheckoutStore } from "../../store/productCheckoutStore";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

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
					display: "flex",
					height: "100%",
					justifyContent: "space-between",
				}}
			>
				<Box>
					<Typography variant="h6" sx={{ textTransform: "capitalize" }}>
						{product.name}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{product.description || "No description available."}
					</Typography>
					<Typography variant="h6" color="primary" sx={{ marginTop: 1 }}>
						Price: {formatCurrency(priceBook?.price || 0, priceBook?.currency?.short_code || "INR")}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Tax ({taxPercentage}%):{" "}
						{formatCurrency(taxAmount, priceBook?.currency?.short_code || "INR")}
					</Typography>
				</Box>
				<Box sx={{ marginTop: 2, display: "flex", alignItems: "center", gap: 1 }}>
					{/* decrement quantity */}
					<IconButton
						onClick={() => {
							changeQuantity(product.id, quantity - 1);
						}}
						disabled={quantity <= 1}
					>
						<RemoveIcon />
					</IconButton>
					<Typography variant="body2">Quantity: {quantity}</Typography>
					<IconButton
						onClick={() => {
							changeQuantity(product.id, quantity + 1);
						}}
					>
						<AddIcon />
					</IconButton>
				</Box>
				<Box sx={{ marginTop: 2 }}>
					<Typography variant="body2">
						Total: {formatCurrency(product?.totalPrice, priceBook?.currency?.short_code || "INR")}
					</Typography>
				</Box>
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
