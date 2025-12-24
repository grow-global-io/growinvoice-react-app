import React from "react";
import { Box, Typography, Grid, Card, CardContent, Chip } from "@mui/material";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import TableChartIcon from "@mui/icons-material/TableChart";
import EditIcon from "@mui/icons-material/Edit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SkipNextIcon from "@mui/icons-material/SkipNext";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	catalogMethod?: string;
}

const catalogMethods = [
	{
		id: "upload",
		icon: TableChartIcon,
		title: "Upload CSV/Excel",
		description: "Import products from a spreadsheet",
		badge: "Recommended",
		badgeColor: "success" as const,
	},
	{
		id: "manual",
		icon: EditIcon,
		title: "Add Manually",
		description: "Add products one by one",
	},
	{
		id: "ai",
		icon: AutoAwesomeIcon,
		title: "AI-Assisted",
		description: "Let AI help create your catalog",
		badge: "Beta",
		badgeColor: "success" as const,
	},
	{
		id: "skip",
		icon: SkipNextIcon,
		title: "Skip for Now",
		description: "Set up products later",
	},
];

const CatalogMethodForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();

	return (
		<Box>
			<Typography variant="h3" textAlign="center">
				{t("getStarted.catalog.title", {
					defaultValue: "How would you like to add your catalog?",
				})}
			</Typography>
			<Typography variant="h6" my={2} color={"secondary.dark"} fontWeight={500} textAlign="center">
				{t("getStarted.catalog.subtitle", {
					defaultValue: "Choose the method that works best for you",
				})}
			</Typography>
			<Grid container spacing={2} mt={1}>
				{catalogMethods.map((method) => {
					const Icon = method.icon as React.ComponentType<{ sx?: any }>;
					const isSelected = values.catalogMethod === method.id;
					const isComingSoon = method.id === "ai";
					return (
						<Grid item xs={12} sm={6} key={method.id}>
							<Card
								sx={{
									cursor: isComingSoon ? "not-allowed" : "pointer",
									border: isSelected ? 2 : 1,
									borderColor: isSelected ? "primary.main" : "grey.300",
									boxShadow: isSelected ? 3 : 1,
									"&:hover": {
										borderColor: isComingSoon ? "grey.300" : "primary.main",
										boxShadow: isComingSoon ? 1 : 3,
									},
									height: "100%",
									position: "relative",
									opacity: isComingSoon ? 0.95 : 1,
								}}
								onClick={() => {
									if (!isComingSoon) {
										setFieldValue("catalogMethod", method.id);
									}
								}}
							>
								{method.badge && (
									<Chip
										label={method.badge}
										color={method.badgeColor}
										size="small"
										sx={{
											position: "absolute",
											top: 8,
											right: 8,
											fontSize: "0.7rem",
											height: 20,
											zIndex: 1,
										}}
									/>
								)}
								<CardContent sx={{ textAlign: "center", p: 2 }}>
									<Icon
										sx={{
											fontSize: 40,
											color: isSelected ? "primary.main" : "grey.600",
											mb: 1,
										}}
									/>
									<Typography variant="h6" fontWeight={600} gutterBottom>
										{method.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{method.description}
									</Typography>
								</CardContent>
								{isComingSoon && (
									<Box
										sx={{
											position: "absolute",
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											background:
												"linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.6))",
											backdropFilter: "blur(1px)",
											borderRadius: 1,
											zIndex: 2,
										}}
									>
										<Typography
											variant="h6"
											fontWeight={700}
											color="primary.main"
											sx={{
												textTransform: "uppercase",
												letterSpacing: 1.5,
												textShadow: "0 1px 3px rgba(255, 255, 255, 0.9)",
											}}
										>
											{t("common.comingSoon", { defaultValue: "Coming Soon" })}
										</Typography>
									</Box>
								)}
							</Card>
						</Grid>
					);
				})}
			</Grid>
		</Box>
	);
};

export default CatalogMethodForm;
