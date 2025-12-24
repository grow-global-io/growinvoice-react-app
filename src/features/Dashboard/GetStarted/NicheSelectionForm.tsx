import React from "react";
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
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SchoolIcon from "@mui/icons-material/School";
import PetsIcon from "@mui/icons-material/Pets";
import HomeIcon from "@mui/icons-material/Home";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import BookIcon from "@mui/icons-material/Book";
import ToysIcon from "@mui/icons-material/Toys";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ComputerIcon from "@mui/icons-material/Computer";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import WatchIcon from "@mui/icons-material/Watch";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BuildIcon from "@mui/icons-material/Build";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useState } from "react";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	niches?: string[];
}

interface NicheOption {
	id: string;
	icon: React.ComponentType;
	title: string;
	searchOnly?: boolean;
}

// Default niches - always visible
const defaultNiches: NicheOption[] = [
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

// Search-only niches - only shown when searching
const searchOnlyNiches: NicheOption[] = [
	{
		id: "gaming",
		icon: SportsEsportsIcon,
		title: "Gaming & Entertainment",
		searchOnly: true,
	},
	{
		id: "education",
		icon: SchoolIcon,
		title: "Educational Products",
		searchOnly: true,
	},
	{
		id: "pet-supplies",
		icon: PetsIcon,
		title: "Pet Supplies",
		searchOnly: true,
	},
	{
		id: "home-decor",
		icon: HomeIcon,
		title: "Home & Decor",
		searchOnly: true,
	},
	{
		id: "fitness",
		icon: FitnessCenterIcon,
		title: "Fitness & Sports",
		searchOnly: true,
	},
	{
		id: "music",
		icon: MusicNoteIcon,
		title: "Music & Audio",
		searchOnly: true,
	},
	{
		id: "books",
		icon: BookIcon,
		title: "Books & Media",
		searchOnly: true,
	},
	{
		id: "toys",
		icon: ToysIcon,
		title: "Toys & Games",
		searchOnly: true,
	},
	{
		id: "art-supplies",
		icon: AutoFixHighIcon,
		title: "Art Supplies",
		searchOnly: true,
	},
	{
		id: "accessories",
		icon: ShoppingBagIcon,
		title: "Accessories",
		searchOnly: true,
	},
	{
		id: "food-beverages",
		icon: RestaurantMenuIcon,
		title: "Food & Beverages",
		searchOnly: true,
	},
	{
		id: "logistics",
		icon: LocalShippingIcon,
		title: "Logistics & Shipping",
		searchOnly: true,
	},
	{
		id: "computers",
		icon: ComputerIcon,
		title: "Computers & Laptops",
		searchOnly: true,
	},
	{
		id: "mobile-phones",
		icon: PhoneAndroidIcon,
		title: "Mobile Phones",
		searchOnly: true,
	},
	{
		id: "watches",
		icon: WatchIcon,
		title: "Watches & Timepieces",
		searchOnly: true,
	},
	{
		id: "cameras",
		icon: CameraAltIcon,
		title: "Cameras & Photography",
		searchOnly: true,
	},
	{
		id: "automotive",
		icon: DirectionsCarIcon,
		title: "Automotive",
		searchOnly: true,
	},
	{
		id: "tools",
		icon: BuildIcon,
		title: "Tools & Hardware",
		searchOnly: true,
	},
	{
		id: "healthcare",
		icon: LocalHospitalIcon,
		title: "Healthcare & Medical",
		searchOnly: true,
	},
	{
		id: "beauty-cosmetics",
		icon: ScienceIcon,
		title: "Beauty & Cosmetics",
		searchOnly: true,
	},
];

// Combined list for finding niches by ID
const allNiches = [...defaultNiches, ...searchOnlyNiches];

const NicheSelectionForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();
	const [searchTerm, setSearchTerm] = useState("");
	const selectedNiches = values.niches || [];

	// When no search term, show only default niches
	// When searching, show default + search-only niches that match
	const filteredNiches = searchTerm
		? [...defaultNiches, ...searchOnlyNiches].filter((niche) =>
				niche.title.toLowerCase().includes(searchTerm.toLowerCase()),
			)
		: defaultNiches;

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
											const niche = allNiches.find((n) => n.id === id);
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
					const Icon = niche.icon as React.ComponentType<{ sx?: any }>;
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
