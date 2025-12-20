import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Switch,
	FormControlLabel,
	TextField,
} from "@mui/material";
import { Field, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import InventoryIcon from "@mui/icons-material/Inventory";
import CircleIcon from "@mui/icons-material/Circle";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import BoltIcon from "@mui/icons-material/Bolt";
import BugReportIcon from "@mui/icons-material/BugReport";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { TextFormField } from "@shared/components/FormFields/TextFormField";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	selfDelivery?: boolean;
	deliveryPartners?: string[];
	deliveryRegions?: string[];
	pickupAddress?: string;
}

const deliveryPartners = [
	{
		id: "shiprocket",
		icon: RocketLaunchIcon,
		title: "Shiprocket",
		color: "#ef4444",
	},
	{
		id: "delhivery",
		icon: InventoryIcon,
		title: "Delhivery",
		color: "#8b4513",
	},
	{
		id: "bluedart",
		icon: CircleIcon,
		title: "Blue Dart",
		color: "#0066cc",
	},
	{
		id: "dtdc",
		icon: DeliveryDiningIcon,
		title: "DTDC",
		color: "#ef4444",
	},
	{
		id: "ecom",
		icon: BoltIcon,
		title: "Ecom Express",
		color: "#fbbf24",
	},
	{
		id: "xpressbees",
		icon: BugReportIcon,
		title: "Xpressbees",
		color: "#fbbf24",
	},
];

const deliveryRegions = [
	{
		id: "local",
		title: "Local (Same City)",
		description: "Within your city.",
	},
	{
		id: "regional",
		title: "Regional",
		description: "Nearby states.",
	},
	{
		id: "pan-india",
		title: "Pan India",
		description: "All across India.",
	},
	{
		id: "international",
		title: "International",
		description: "Global shipping.",
	},
];

const DeliveryOptionsForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();
	const selectedPartners = values.deliveryPartners || [];
	const selectedRegions = values.deliveryRegions || [];

	const handleTogglePartner = (partnerId: string) => {
		const currentPartners = selectedPartners;
		if (currentPartners.includes(partnerId)) {
			setFieldValue(
				"deliveryPartners",
				currentPartners.filter((id) => id !== partnerId),
			);
		} else {
			setFieldValue("deliveryPartners", [...currentPartners, partnerId]);
		}
	};

	const handleToggleRegion = (regionId: string) => {
		const currentRegions = selectedRegions;
		if (currentRegions.includes(regionId)) {
			setFieldValue(
				"deliveryRegions",
				currentRegions.filter((id) => id !== regionId),
			);
		} else {
			setFieldValue("deliveryRegions", [...currentRegions, regionId]);
		}
	};

	return (
		<Box>
			<Typography variant="h3" textAlign="center">
				{t("getStarted.delivery.title", {
					defaultValue: "Configure delivery options",
				})}
			</Typography>
			<Typography variant="h6" my={2} color={"secondary.dark"} fontWeight={500} textAlign="center">
				{t("getStarted.delivery.subtitle", {
					defaultValue: "Set up how you'll deliver products to customers",
				})}
			</Typography>

			{/* Self Delivery Section */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mt: 3,
					p: 2,
					border: 1,
					borderColor: "grey.300",
					borderRadius: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<LocalShippingIcon sx={{ fontSize: 32, color: "success.main" }} />
					<Box>
						<Typography variant="h6" fontWeight={600}>
							{t("getStarted.delivery.selfDelivery", { defaultValue: "Self Delivery" })}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{t("getStarted.delivery.selfDeliveryDescription", {
								defaultValue: "Handle deliveries yourself",
							})}
						</Typography>
					</Box>
				</Box>
				<FormControlLabel
					control={
						<Switch
							checked={values.selfDelivery || false}
							onChange={(e) => setFieldValue("selfDelivery", e.target.checked)}
							color="primary"
						/>
					}
					label=""
				/>
			</Box>

			{/* Third-party Delivery Partners */}
			<Box mt={4}>
				<Typography variant="h6" fontWeight={600} mb={2}>
					{t("getStarted.delivery.thirdPartyPartners", {
						defaultValue: "Third-party Delivery Partners",
					})}
				</Typography>
				<Grid container spacing={2}>
					{deliveryPartners.map((partner) => {
						const Icon = partner.icon;
						const isSelected = selectedPartners.includes(partner.id);
						return (
							<Grid item xs={6} sm={4} key={partner.id}>
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
									onClick={() => handleTogglePartner(partner.id)}
								>
									<CardContent sx={{ textAlign: "center", p: 2 }}>
										<Icon
											sx={{
												fontSize: 32,
												color: partner.color,
												mb: 1,
											}}
										/>
										<Typography variant="body1" fontWeight={500}>
											{partner.title}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			</Box>

			{/* Where do you deliver? */}
			<Box mt={4}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<LocationOnIcon sx={{ fontSize: 24, color: "primary.main" }} />
					<Typography variant="h6" fontWeight={600}>
						{t("getStarted.delivery.whereDeliver", {
							defaultValue: "Where do you deliver?",
						})}
					</Typography>
				</Box>
				<Grid container spacing={2}>
					{deliveryRegions.map((region) => {
						const isSelected = selectedRegions.includes(region.id);
						return (
							<Grid item xs={12} sm={6} key={region.id}>
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
									onClick={() => handleToggleRegion(region.id)}
								>
									<CardContent sx={{ p: 2 }}>
										<Typography variant="body1" fontWeight={600} gutterBottom>
											{region.title}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{region.description}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			</Box>

			{/* Pickup Address */}
			<Box mt={4}>
				<Typography variant="h6" fontWeight={600} mb={2}>
					{t("getStarted.delivery.pickupAddress", {
						defaultValue: "Pickup Address",
					})}
				</Typography>
				<Field
					name="pickupAddress"
					label={t("getStarted.delivery.pickupAddressLabel", {
						defaultValue: "Pickup Address",
					})}
					component={TextFormField}
					placeholder={t("getStarted.delivery.pickupAddressPlaceholder", {
						defaultValue: "Enter your warehouse/store address",
					})}
					multiline
					rows={3}
				/>
				<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
					{t("getStarted.delivery.pickupAddressHelper", {
						defaultValue: "This is where delivery partners will pick up orders from",
					})}
				</Typography>
			</Box>
		</Box>
	);
};

export default DeliveryOptionsForm;
