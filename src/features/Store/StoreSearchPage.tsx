import StoreNavbar from "./StoreNavbar";
import { useProductCheckoutStore } from "@store/productCheckoutStore";
import { useStoreControllerSearchProducts } from "@api/services/store";
import Loader from "@shared/components/Loader";
import NoDataFound from "@shared/components/NoDataFound";
import {
	Avatar,
	Box,
	Card,
	CardContent,
	CardMedia,
	Divider,
	Grid,
	Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@shared/formatter";

const StoreSearchPage = () => {
	const { searchTerm, currencyCode } = useProductCheckoutStore();
	const search = useStoreControllerSearchProducts({
		query: searchTerm || "",
		currency: currencyCode || "INR", // Default to INR if no currency code is set
	});

	const navigate = useNavigate();

	if (search.isLoading) {
		return (
			<StoreNavbar>
				<Loader />
			</StoreNavbar>
		);
	}
	if (search.data?.length === 0) {
		return (
			<StoreNavbar>
				<NoDataFound message="No products found for the given search term." />
			</StoreNavbar>
		);
	}
	return (
		<StoreNavbar>
			<Grid container spacing={2} sx={{ padding: 2 }}>
				{search.data?.map((product) => {
					const priceBook = product?.product?.[0]?.priceBook?.find(
						(price) => price.currency?.short_code === currencyCode,
					);
					// Calculate tax percentage from product taxes
					const taxPercentage =
						product?.product?.[0]?.tax?.reduce(
							(acc, tax) => acc + (tax?.tax?.percentage || 0),
							0,
						) || 0;
					// Calculate price with tax included
					const priceWithTax = priceBook?.price
						? parseFloat((priceBook.price + (priceBook.price * taxPercentage) / 100).toFixed(2))
						: 0;
					return (
						<Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
							<Card
								onClick={() => {
									navigate(`/store/${product.storeName}`);
								}}
								sx={{
									cursor: "pointer",
									transition: "transform 0.2s",
									"&:hover": {
										transform: "scale(1.05)",
										boxShadow: 3,
									},
									height: "100%",
									display: "flex",
									flexDirection: "column",
								}}
							>
								<CardMedia
									component="img"
									image={product.product?.[0]?.images?.[0] || ""}
									alt={product.name || "Product Image"}
									sx={{
										height: 140,
										objectFit: "cover",
										borderRadius: "8px 8px 0 0",
									}}
								/>
								<CardContent sx={{ flexGrow: 1 }}>
									<Typography variant="h5" component="div" sx={{ textTransform: "capitalize" }}>
										{product?.product?.[0]?.name}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{product?.product?.[0]?.description ?? ""}
									</Typography>
									<Typography variant="h6" color="primary" sx={{ marginTop: 1 }}>
										{formatCurrency(priceWithTax, priceBook?.currency?.short_code || "INR")}
									</Typography>
									<Divider sx={{ margin: "8px 0" }} />
									<Typography variant="body2" color="text.secondary">
										Company:
									</Typography>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<Avatar
											src={product?.company?.[0]?.logo || ""}
											alt={product?.company?.[0]?.name || "Company Logo"}
											sx={{ width: 40, height: 40, marginRight: 1 }}
										/>
										<Typography variant="h6" color="text.secondary">
											{product?.company?.[0]?.name || "Unknown Company"}
										</Typography>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					);
				})}
			</Grid>
		</StoreNavbar>
	);
};

export default StoreSearchPage;
