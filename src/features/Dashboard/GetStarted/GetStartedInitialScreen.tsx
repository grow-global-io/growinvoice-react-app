import {
	Box,
	Button,
	Card,
	CardActionArea,
	CardContent,
	Chip,
	Stack,
	Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import greetImg from "@assets/img/greet-img.png";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface Props {
	onQuickSetup: () => void;
	onGuidedSetup: () => void;
	onDismiss?: () => void;
	detectedInfo?: {
		currency?: string;
		countryName?: string;
		companyName?: string;
	};
	isSubmitting?: boolean;
}

const GetStartedInitialScreen = ({
	onQuickSetup,
	onGuidedSetup,
	onDismiss,
	detectedInfo,
	isSubmitting = false,
}: Props) => {
	const { t } = useTranslation();

	const hasDetected = detectedInfo?.countryName || detectedInfo?.currency || detectedInfo?.companyName;

	return (
		<Box textAlign="center" py={1}>
			{/* Human Illustration */}
			<Box
				component="img"
				src={greetImg}
				alt="Welcome to GrowInvoice"
				sx={{
					width: "auto",
					height: { xs: 110, sm: 125 },
					maxHeight: 130,
					objectFit: "contain",
					mx: "auto",
					mb: 2,
					display: "block",
					filter: "drop-shadow(0 6px 16px rgba(0, 0, 0, 0.06))",
				}}
			/>

			{/* Header Title & Subtitle */}
			<Box mb={2}>
				<Typography
					variant="h4"
					fontWeight={800}
					sx={{
						color: "#0f172a",
						fontSize: { xs: "1.35rem", sm: "1.6rem" },
						letterSpacing: "-0.015em",
						mb: 0.75,
					}}
				>
					{t("getStarted.initial.welcomeTitle", { defaultValue: "Welcome to GrowInvoice" })}
				</Typography>
				<Typography
					variant="body2"
					sx={{
						color: "#64748b",
						maxWidth: "460px",
						mx: "auto",
						lineHeight: 1.5,
						fontSize: "0.875rem",
					}}
				>
					{t("getStarted.initial.welcomeSubtitle", {
						defaultValue: "Set up your business in seconds and start creating professional invoices immediately.",
					})}
				</Typography>

				{/* Auto-detected Region Info Pill */}
				{detectedInfo?.countryName && (
					<Box display="flex" justifyContent="center" mt={1.5}>
						<Chip
							icon={<PublicOutlinedIcon sx={{ fontSize: "14px !important", color: "primary.main" }} />}
							label={`${detectedInfo.countryName}${detectedInfo.currency ? ` (${detectedInfo.currency})` : ""}`}
							size="small"
							variant="outlined"
							sx={{
								fontWeight: 600,
								fontSize: "0.75rem",
								bgcolor: "rgba(25, 118, 210, 0.04)",
								borderColor: "rgba(25, 118, 210, 0.25)",
								color: "primary.main",
								borderRadius: "16px",
							}}
						/>
					</Box>
				)}
			</Box>

			{/* Setup Option Cards */}
			<Stack spacing={2} sx={{ maxWidth: "480px", mx: "auto", textAlign: "left" }}>
				{/* 1. Quick / Express Setup (Recommended) */}
				<Card
					variant="outlined"
					sx={{
						borderColor: "primary.main",
						borderWidth: 2,
						bgcolor: "rgba(25, 118, 210, 0.02)",
						borderRadius: 2.5,
						transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
						position: "relative",
						overflow: "visible",
						"&:hover": {
							borderColor: "primary.dark",
							bgcolor: "rgba(25, 118, 210, 0.05)",
							boxShadow: "0 6px 20px rgba(25, 118, 210, 0.15)",
							transform: "translateY(-1px)",
						},
					}}
				>
					<Box
						sx={{
							position: "absolute",
							top: -10,
							right: 16,
							bgcolor: "primary.main",
							color: "#ffffff",
							px: 1.25,
							py: 0.25,
							borderRadius: "10px",
							fontSize: "0.68rem",
							fontWeight: 700,
							letterSpacing: "0.3px",
							textTransform: "uppercase",
							boxShadow: "0 2px 8px rgba(25, 118, 210, 0.25)",
						}}
					>
						{t("getStarted.recommended", { defaultValue: "Fastest • 30 Seconds" })}
					</Box>
					<CardActionArea onClick={onQuickSetup} disabled={isSubmitting} sx={{ p: 2, borderRadius: 2.5 }}>
						<CardContent sx={{ p: 0 }}>
							<Box display="flex" alignItems="flex-start" gap={1.75}>
								<Box
									sx={{
										bgcolor: "primary.main",
										color: "#ffffff",
										borderRadius: 2,
										p: 1.25,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										boxShadow: "0 2px 8px rgba(25, 118, 210, 0.25)",
									}}
								>
									<RocketLaunchOutlinedIcon sx={{ fontSize: 24 }} />
								</Box>
								<Box flex={1}>
									<Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary" }}>
										{t("getStarted.quickSetup.title", { defaultValue: "Quick Setup — Start Invoicing Now" })}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mt: 0.35, fontSize: "0.825rem", lineHeight: 1.45 }}
									>
										{t("getStarted.quickSetup.desc", {
											defaultValue:
												"Auto-configures your business name and detected currency so you can start creating invoices right away.",
										})}
									</Typography>
									<Box display="flex" alignItems="center" gap={0.75} mt={1}>
										<CheckCircleOutlineIcon sx={{ fontSize: 15, color: "success.main" }} />
										<Typography variant="caption" color="text.secondary" fontWeight={500}>
											{t("getStarted.quickSetup.perk", {
												defaultValue: "Configure taxes, banking & logo later anytime in Settings",
											})}
										</Typography>
									</Box>
								</Box>
							</Box>
						</CardContent>
					</CardActionArea>
				</Card>

				{/* 2. Custom Guided Setup */}
				<Card
					variant="outlined"
					sx={{
						borderColor: "divider",
						borderRadius: 2.5,
						transition: "all 0.2s ease",
						"&:hover": {
							borderColor: "primary.light",
							boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
							transform: "translateY(-1px)",
						},
					}}
				>
					<CardActionArea onClick={onGuidedSetup} disabled={isSubmitting} sx={{ p: 2, borderRadius: 2.5 }}>
						<CardContent sx={{ p: 0 }}>
							<Box display="flex" alignItems="flex-start" gap={1.75}>
								<Box
									sx={{
										bgcolor: "grey.100",
										color: "text.secondary",
										borderRadius: 2,
										p: 1.25,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<TuneOutlinedIcon sx={{ fontSize: 24 }} />
								</Box>
								<Box flex={1}>
									<Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary" }}>
										{t("getStarted.guidedSetup.title", { defaultValue: "Guided Setup (Review Details)" })}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mt: 0.35, fontSize: "0.825rem", lineHeight: 1.45 }}
									>
										{t("getStarted.guidedSetup.desc", {
											defaultValue:
												"Review company name, currency, phone, and optional tax details step-by-step.",
										})}
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</CardActionArea>
				</Card>
			</Stack>

			{/* Direct CTA Button */}
			<Box mt={3}>
				<Button
					variant="contained"
					size="large"
					endIcon={<ArrowForwardIcon />}
					onClick={onQuickSetup}
					disabled={isSubmitting}
					sx={{
						px: 4,
						py: 1.25,
						fontWeight: 700,
						fontSize: "0.95rem",
						textTransform: "none",
						borderRadius: 2,
						boxShadow: "0 4px 14px rgba(25, 118, 210, 0.28)",
						"&:hover": {
							boxShadow: "0 6px 18px rgba(25, 118, 210, 0.38)",
						},
					}}
				>
					{isSubmitting
						? t("app.loading", { defaultValue: "Setting up..." })
						: t("getStarted.quickSetup.button", { defaultValue: "Quick Start & Create Invoice" })}
				</Button>
			</Box>

			{/* Polite Skip/Later Option */}
			{onDismiss && (
				<Box mt={1.5}>
					<Button
						variant="text"
						size="small"
						onClick={onDismiss}
						sx={{
							color: "text.secondary",
							textTransform: "none",
							fontSize: "0.8rem",
							"&:hover": { color: "text.primary" },
						}}
					>
						{t("getStarted.skipForNow", { defaultValue: "I'll do this later" })}
					</Button>
				</Box>
			)}
		</Box>
	);
};

export default GetStartedInitialScreen;
