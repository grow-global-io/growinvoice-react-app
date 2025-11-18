import {
	Box,
	Button,
	Dialog,
	DialogActions, // 1. Import DialogActions
	DialogContent,
	Typography,
} from "@mui/material";
import { type ProductWithAllDataDto } from "../../api/services/auth/models";
import AppDialogHeader from "../../shared/components/Dialog/AppDialogHeader";
import { useProductCheckoutStore } from "@store/productCheckoutStore";
import { formatCurrency } from "@shared/formatter";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import i18n from "../../i18s";

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
	const { t } = useTranslation();
	const {
		currencyCode,
		checkoutProducts,
		removeAllProductsFromCheckout,
		addProductToCheckout,
		removeProductFromCheckout,
	} = useProductCheckoutStore();

	// Force re-render when translations are loaded or language changes
	const [, forceUpdate] = useState({});
	useEffect(() => {
		const handleLanguageChange = () => {
			forceUpdate({});
		};
		i18n.on("languageChanged", handleLanguageChange);
		i18n.on("loaded", handleLanguageChange);
		return () => {
			i18n.off("languageChanged", handleLanguageChange);
			i18n.off("loaded", handleLanguageChange);
		};
	}, []);

	// Helper function to get translations from resources directly
	// This works around i18next's issue with keys containing dots in the parent name
	const getTranslation = (key: string, defaultValue: string): string => {
		try {
			const resources = i18n.getResourceBundle(i18n.language, "translation");
			if (resources && resources["store.product"]) {
				const storeProduct = resources["store.product"] as Record<string, string>;
				if (key === "store.product.noImages" && storeProduct.noImages) {
					return storeProduct.noImages;
				}
				if (key === "store.product.noDescription" && storeProduct.noDescription) {
					return storeProduct.noDescription;
				}
				if (key === "store.product.details" && storeProduct.details) {
					return storeProduct.details;
				}
				if (key === "store.product.price" && storeProduct.price) {
					return storeProduct.price;
				}
			}
			// Fallback to i18n.t() if direct access doesn't work
			const translation = i18n.t(key, { defaultValue, ns: "translation" });
			return translation === key ? defaultValue : translation;
		} catch (error) {
			return defaultValue;
		}
	};

	// First try to find priceBook matching the store currency, otherwise use the first available priceBook
	const priceBook =
		product?.priceBook?.find((price) => price.currency?.short_code === currencyCode) ||
		product?.priceBook?.[0];

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
			<AppDialogHeader
				title={getTranslation("store.product.details", "Product Details")}
				handleClose={handleClose}
			/>
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
								{getTranslation("store.product.noImages", "No Images Available")}
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
							{product?.name || t("store.product.name", { defaultValue: "Product Name" })}
						</Typography>
						{product?.description ? (
							<Typography variant="body1" color="text.secondary">
								{product.description}
							</Typography>
						) : (
							<Typography variant="body1" color="text.secondary" sx={{ fontStyle: "italic" }}>
								{getTranslation("store.product.noDescription", "No description available.")}
							</Typography>
						)}
						<Typography variant="h6" color="primary" sx={{ marginTop: 2 }}>
							{getTranslation("store.product.price", "Price:")}{" "}
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
					{checkoutProducts.some((p) => p.id === product?.id)
						? t("store.removeFromCart", { defaultValue: "Remove from Cart" })
						: t("store.addToCart", { defaultValue: "Add to Cart" })}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ProductDialog;
