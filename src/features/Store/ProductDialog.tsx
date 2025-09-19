import React from "react";
import {
	Box,
	Button,
	Dialog,
	DialogActions, // 1. Import DialogActions
	DialogContent,
	Typography,
} from "@mui/material";
import { ProductWithAllDataDto } from "../../api/services/auth/models";
import AppDialogHeader from "../../shared/components/Dialog/AppDialogHeader";
import { useProductCheckoutStore } from "@store/productCheckoutStore";
import { formatCurrency } from "@shared/formatter";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
	desktop: {
		breakpoint: { max: 3000, min: 1024 },
		items: 1,
	},
	tablet: {
		breakpoint: { max: 1024, min: 464 },
		items: 1,
	},
	mobile: {
		breakpoint: { max: 464, min: 0 },
		items: 1,
	},
};

const ProductDialog = ({
	open,
	handleClose,
	product,
}: {
	open: boolean;
	handleClose: () => void;
	product?: ProductWithAllDataDto;
}) => {
	const {
		currencyCode,
		checkoutProducts,
		removeAllProductsFromCheckout,
		addProductToCheckout,
		removeProductFromCheckout,
	} = useProductCheckoutStore();
	const priceBook = product?.priceBook?.find(
		(price) => price.currency?.short_code === currencyCode,
	);

	// A placeholder function for adding to cart
	const handleAddToCart = () => {
		if (checkoutProducts.some((p) => p.user_id !== product?.user_id)) {
			removeAllProductsFromCheckout && removeAllProductsFromCheckout();
		}
		if (product && !checkoutProducts.some((p) => p.id === product.id)) {
			addProductToCheckout(product);
		} else if (product) {
			removeProductFromCheckout(product.id);
		}
	};
	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<AppDialogHeader title="Product Details" handleClose={handleClose} />
			<DialogContent>
				<Carousel
					responsive={responsive}
					centerMode={true}
					showDots={true}
					autoPlay={true}
					infinite={true}
					containerClass="carousel-container"
					itemClass="carousel-item-padding-40-px"
				>
					{product?.images?.map((img, index) => (
						<Box
							key={img}
							sx={{
								width: { xs: "100%", sm: "100%" },
								height: "300px",
								flexShrink: 0, // Prevent image box from shrinking
							}}
						>
							<img
								src={img}
								alt={`${product?.name} - ${index + 1}`}
								style={{ width: "300px", height: "300px", borderRadius: "8px", objectFit: "cover" }}
							/>
						</Box>
					))}
					{!product?.images?.length && (
						<Box
							sx={{
								width: { xs: "100%", sm: "300px" },
								height: "300px",
								flexShrink: 0, // Prevent image box from shrinking
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: "#f0f0f0",
								borderRadius: "8px",
							}}
						>
							<Typography variant="h6" color="text.secondary">
								No Images Available
							</Typography>
						</Box>
					)}
				</Carousel>
				<Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
					{/* <Box
						sx={{
							width: { xs: "100%", sm: "300px" },
							height: "300px",
							flexShrink: 0, // Prevent image box from shrinking
						}}
					>
						<img
							src={product?.image ?? ""}
							alt={product?.name}
							style={{ width: "100%", height: "100%", borderRadius: "8px", objectFit: "cover" }}
						/>
					</Box> */}
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 1,
							padding: { xs: 0, sm: 2 },
						}}
					>
						<Typography variant="h3" sx={{ textTransform: "capitalize" }}>
							{product?.name || "Product Name"}
						</Typography>
						<Typography variant="body1" color="text.secondary">
							{product?.description || "Product Description"}
						</Typography>
						<Typography variant="h6" color="primary" sx={{ marginTop: 2 }}>
							Price:{" "}
							{formatCurrency(priceBook?.price || 0, priceBook?.currency?.short_code || "INR")}
						</Typography>
					</Box>
				</Box>
			</DialogContent>

			{/* 2. Add the DialogActions component for the footer buttons */}
			<DialogActions sx={{ padding: "16px 24px" }}>
				<Button
					variant="contained"
					color={checkoutProducts.some((p) => p.id === product?.id) ? "error" : "primary"}
					onClick={handleAddToCart}
					sx={{ flexGrow: 1 }}
				>
					{checkoutProducts.some((p) => p.id === product?.id) ? "Remove from Cart" : "Add to Cart"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ProductDialog;
