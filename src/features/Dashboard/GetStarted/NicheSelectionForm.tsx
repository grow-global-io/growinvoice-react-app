import { Box, Typography, Grid, Card, CardContent, TextField, InputAdornment } from "@mui/material";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import SearchIcon from "@mui/icons-material/Search";
import PaletteIcon from "@mui/icons-material/Palette";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DiamondIcon from "@mui/icons-material/Diamond";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RecyclingIcon from "@mui/icons-material/Recycling";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PublicIcon from "@mui/icons-material/Public";
import EditIcon from "@mui/icons-material/Edit";
import InventoryIcon from "@mui/icons-material/Inventory";
import HolidayVillageIcon from "@mui/icons-material/HolidayVillage";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useState } from "react";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	niches?: string[];
}

const nicheOptions = [
	{
		id: "handmade",
		icon: PaletteIcon,
		title: "Handmade & Crafts",
	},
	{
		id: "organic",
		icon: LocalFloristIcon,
		title: "Organic & Natural",
	},
	{
		id: "vintage",
		icon: AccessTimeIcon,
		title: "Vintage & Antique",
	},
	{
		id: "luxury",
		icon: DiamondIcon,
		title: "Luxury & Premium",
	},
	{
		id: "budget",
		icon: AttachMoneyIcon,
		title: "Budget Friendly",
	},
	{
		id: "eco-friendly",
		icon: RecyclingIcon,
		title: "Eco-Friendly",
	},
	{
		id: "local",
		icon: LocationOnIcon,
		title: "Local & Regional",
	},
	{
		id: "imported",
		icon: PublicIcon,
		title: "Imported Goods",
	},
	{
		id: "customizable",
		icon: EditIcon,
		title: "Customizable Products",
	},
	{
		id: "subscription",
		icon: InventoryIcon,
		title: "Subscription Based",
	},
	{
		id: "seasonal",
		icon: HolidayVillageIcon,
		title: "Seasonal Items",
	},
	{
		id: "wholesale",
		icon: BarChartIcon,
		title: "Wholesale & Bulk",
	},
];

const NicheSelectionForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();
	const [searchTerm, setSearchTerm] = useState("");
	const selectedNiches = values.niches || [];

	const filteredNiches = nicheOptions.filter((niche) =>
		niche.title.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handleToggleNiche = (nicheId: string) => {
		const currentNiches = selectedNiches;
		if (currentNiches.includes(nicheId)) {
			setFieldValue(
				"niches",
				currentNiches.filter((id) => id !== nicheId),
			);
		} else {
			setFieldValue("niches", [...currentNiches, nicheId]);
		}
	};

	return (
		<Box>
			<Typography variant="h3" textAlign="center">
				{t("getStarted.niche.title", { defaultValue: "What's your niche?" })}
			</Typography>
			<Typography variant="h6" my={2} color={"secondary.dark"} fontWeight={500} textAlign="center">
				{t("getStarted.niche.subtitle", {
					defaultValue: "Select all that apply to help customers find you",
				})}
			</Typography>
			<Box mb={3}>
				<TextField
					fullWidth
					placeholder={t("getStarted.niche.searchPlaceholder", {
						defaultValue: "Search niches...",
					})}
					value={
						searchTerm
							? searchTerm
							: selectedNiches.length > 0
								? selectedNiches
										.map((id) => {
											const niche = nicheOptions.find((n) => n.id === id);
											return niche?.title || id;
										})
										.join(", ")
								: ""
					}
					onChange={(e) => {
						setSearchTerm(e.target.value);
					}}
					onFocus={() => {
						// Clear selected items display when focusing to search
						if (selectedNiches.length > 0 && !searchTerm) {
							setSearchTerm("");
						}
					}}
					onBlur={() => {
						// Show selected items again when not focused and no search term
						if (!searchTerm && selectedNiches.length > 0) {
							setSearchTerm("");
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
					sx={{
						"& .MuiOutlinedInput-root": {
							borderRadius: 2,
						},
					}}
				/>
			</Box>
			<Grid container spacing={2}>
				{filteredNiches.map((niche) => {
					const Icon = niche.icon;
					const isSelected = selectedNiches.includes(niche.id);
					return (
						<Grid item xs={12} sm={6} md={4} key={niche.id}>
							<Card
								sx={{
									cursor: "pointer",
									border: isSelected ? 2 : 1,
									borderColor: isSelected ? "success.main" : "grey.300",
									boxShadow: isSelected ? 3 : 1,
									"&:hover": {
										borderColor: "success.main",
										boxShadow: 3,
									},
									height: "100%",
								}}
								onClick={() => handleToggleNiche(niche.id)}
							>
								<CardContent
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1.5,
										p: 1.5,
									}}
								>
									<Icon
										sx={{
											fontSize: 24,
											color: isSelected ? "success.main" : "grey.600",
										}}
									/>
									<Typography variant="body2" fontWeight={500}>
										{niche.title}
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

export default NicheSelectionForm;
