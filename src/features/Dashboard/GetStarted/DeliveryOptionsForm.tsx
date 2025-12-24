import React, { useState } from "react";
import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Switch,
	FormControlLabel,
	Button,
	Link,
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
import AddIcon from "@mui/icons-material/Add";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { Dialog } from "@mui/material";
import PickupAddressForm from "../../Settings/ShippingServices/PickupAddressForm";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	selfDelivery?: boolean;
	deliveryPartners?: string[];
	deliveryRegions?: string[];
	pickupAddress?: string;
	pickupAddressId?: string;
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
	const [openPickupDialog, setOpenPickupDialog] = useState(false);

	// TODO: Replace with actual API call when backend is ready
	// const pickupAddresses = usePickupAddressControllerFindAll();
	const pickupAddresses: Array<{ id: string; label: string; value: string }> = [];

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
					<Box sx={{ textAlign: "left" }}>
						<Typography variant="h6" fontWeight={600} textAlign="left">
							{t("getStarted.delivery.selfDelivery", { defaultValue: "Self Delivery" })}
						</Typography>
						<Typography variant="body2" color="text.secondary" textAlign="left">
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
						const Icon = partner.icon as React.ComponentType<{ sx?: any }>;
						const isSelected = selectedPartners.includes(partner.id);
						const isComingSoon = partner.id !== "shiprocket";
						return (
							<Grid item xs={6} sm={4} key={partner.id}>
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
											handleTogglePartner(partner.id);
										}
									}}
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
												variant="body2"
												fontWeight={700}
												color="primary.main"
												sx={{
													textTransform: "uppercase",
													letterSpacing: 1,
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
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
					<Typography variant="h6" fontWeight={600}>
						{t("getStarted.delivery.pickupAddress", {
							defaultValue: "Pickup Address",
						})}
					</Typography>
					<Button
						size="small"
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={() => setOpenPickupDialog(true)}
					>
						{t("pickupAddress.add", { defaultValue: "Add Pickup Address" })}
					</Button>
				</Box>
				<Field
					name="pickupAddressId"
					label={t("getStarted.delivery.pickupAddressLabel", {
						defaultValue: "Select Pickup Address",
					})}
					component={AutocompleteField}
					options={pickupAddresses}
					placeholder={t("getStarted.delivery.pickupAddressPlaceholder", {
						defaultValue: "Select or enter pickup address",
					})}
				/>
				<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
					{t("getStarted.delivery.pickupAddressHelper", {
						defaultValue: "This is where delivery partners will pick up orders from",
					})}
				</Typography>
				<Typography variant="caption" color="primary" sx={{ mt: 0.5, display: "block" }}>
					<Link
						href="/setting/shippingservices"
						target="_blank"
						underline="hover"
						sx={{ cursor: "pointer" }}
					>
						{t("getStarted.delivery.managePickupAddresses", {
							defaultValue: "Manage pickup addresses in Settings",
						})}
					</Link>
				</Typography>
			</Box>
			<Dialog
				open={openPickupDialog}
				onClose={() => setOpenPickupDialog(false)}
				fullWidth
				maxWidth="sm"
			>
				<PickupAddressForm
					handleClose={() => {
						setOpenPickupDialog(false);
						// TODO: Refresh pickup addresses list after adding
					}}
				/>
			</Dialog>
		</Box>
	);
};

export default DeliveryOptionsForm;
