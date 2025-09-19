import React, { useMemo } from "react";
import { ProductWithAllDataDto } from "../../api/services/auth/models";
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { formatCurrency } from "@shared/formatter";
import { useProductCheckoutStore } from "@store/productCheckoutStore";
import { useDialog } from "@shared/hooks/useDialog";
import ProductDialog from "./ProductDialog";

const ProductCard = ({ product }: { product: ProductWithAllDataDto | undefined }) => {
	const {
		currencyCode,
		addProductToCheckout,
		checkoutProducts,
		removeProductFromCheckout,
		removeAllProductsFromCheckout,
	} = useProductCheckoutStore();

	const { handleClickOpen, handleClose, open } = useDialog();

	const priceBook = useMemo(() => {
		if (!product) return null;

		return product.priceBook?.find((price) => price.currency?.short_code === currencyCode) || null;
	}, [product, currencyCode]);
	return (
		<Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* {product?.images && (
				<CardMedia
					component="img"
					src={product?.images[0]}
					alt={product?.name}
					title={product?.name}
					sx={{
						height: 140,
						objectFit: "cover",
						borderRadius: "8px 8px 0 0",
						cursor: "pointer",
					}}
					onClick={handleClickOpen}
				/>
			)} */}
			{product?.images && product.images.length > 0 && (
				<CardMedia
					component="img"
					src={product?.images[0]}
					alt={product?.name}
					title={product?.name}
					sx={{
						height: 140,
						objectFit: "cover",
						borderRadius: "8px 8px 0 0",
						cursor: "pointer",
					}}
					onClick={handleClickOpen}
				/>
			)}
			{(!product?.images || product.images.length === 0) && (
				<CardMedia
					component="img"
					src={"https://via.placeholder.com/300x140?text=No+Image"}
					alt={product?.name || "No Image"}
					title={product?.name || "No Image"}
					sx={{
						height: 140,
						objectFit: "cover",
						borderRadius: "8px 8px 0 0",
						cursor: "pointer",
					}}
					onClick={handleClickOpen}
				/>
			)}
			<CardContent sx={{ flexGrow: 1 }}>
				<Typography
					variant="h5"
					component="div"
					sx={{ textTransform: "capitalize", cursor: "pointer" }}
					onClick={handleClickOpen}
				>
					{product?.name}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{product?.description}
				</Typography>
				<Typography variant="h6" color="primary" sx={{ marginTop: 1 }}>
					{formatCurrency(priceBook?.price || 0, priceBook?.currency?.short_code || "INR")}
				</Typography>
			</CardContent>
			<CardActions>
				<Button
					size="small"
					color={checkoutProducts.some((p) => p.id === product?.id) ? "error" : "primary"}
					variant="contained"
					fullWidth
					onClick={() => {
						if (checkoutProducts.some((p) => p.user_id !== product?.user_id)) {
							removeAllProductsFromCheckout && removeAllProductsFromCheckout();
						}
						if (product && !checkoutProducts.some((p) => p.id === product.id)) {
							addProductToCheckout(product);
						} else if (product) {
							removeProductFromCheckout(product.id);
						}
					}}
				>
					{checkoutProducts.some((p) => p.id === product?.id) ? "Remove from Cart" : "Add to Cart"}
				</Button>
				<ProductDialog product={product} handleClose={handleClose} open={open} />
			</CardActions>
		</Card>
	);
};

export default ProductCard;
