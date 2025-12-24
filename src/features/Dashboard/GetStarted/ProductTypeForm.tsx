import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import StoreIcon from "@mui/icons-material/Store";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DevicesIcon from "@mui/icons-material/Devices";
import SpaIcon from "@mui/icons-material/Spa";
import CategoryIcon from "@mui/icons-material/Category";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	productType?: string;
	businessName?: string;
}

const businessTypes = [
	{
		id: "retail",
		icon: StoreIcon,
		title: "Retail Store",
		description: "Physical products, general merchandise",
	},
	{
		id: "fashion",
		icon: CheckroomIcon,
		title: "Fashion & Apparel",
		description: "Clothing, accessories, footwear",
	},
	{
		id: "food",
		icon: RestaurantIcon,
		title: "Food & Beverages",
		description: "Restaurant, bakery, grocery",
	},
	{
		id: "electronics",
		icon: DevicesIcon,
		title: "Electronics",
		description: "Gadgets, appliances, tech",
	},
	{
		id: "beauty",
		icon: SpaIcon,
		title: "Beauty & Wellness",
		description: "Cosmetics, skincare, health",
	},
	{
		id: "other",
		icon: CategoryIcon,
		title: "Other",
		description: "Custom business type",
	},
];

const ProductTypeForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();

	return (
		<Box>
			<Typography variant="h3" textAlign="center">
				{t("getStarted.productType.title", { defaultValue: "What kind of products do you sell?" })}
			</Typography>
			<Typography variant="h6" my={2} color={"secondary.dark"} fontWeight={500} textAlign="center">
				{t("getStarted.productType.subtitle", {
					defaultValue: "Tell us about the products or services you offer.",
				})}
			</Typography>
			<Grid container spacing={2} mt={1}>
				{businessTypes.map((type) => {
					const Icon = type.icon;
					const isSelected = values.productType === type.id;
					return (
						<Grid item xs={6} sm={4} key={type.id}>
							<Card
								sx={{
									cursor: "pointer",
									border: isSelected ? 2 : 1,
									borderColor: isSelected ? "primary.main" : "grey.300",
									boxShadow: isSelected ? 3 : 1,
									"&:hover": {
										borderColor: "primary.main",
										boxShadow: 3,
									},
									height: "100%",
								}}
								onClick={() => setFieldValue("productType", type.id)}
							>
								<CardContent sx={{ textAlign: "center", p: 2 }}>
									<Icon
										sx={{
											fontSize: 40,
											color: isSelected ? "primary.main" : "grey.600",
											mb: 1,
										}}
									/>
									<Typography variant="h6" fontWeight={600} gutterBottom>
										{type.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{type.description}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					);
				})}
			</Grid>
		</Box>
	);
};

export default ProductTypeForm;
