import { Box, Typography, TextField, Card, CardContent, Chip, Link } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import WebhookIcon from "@mui/icons-material/Webhook";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	whatsappCommunityUrl?: string;
	instagramHandle?: string;
	facebookPageId?: string;
	webhookUrl?: string;
}

const ConnectSocialsForm = () => {
	const { t } = useTranslation();
	const { values } = useFormikContext<ExtendedFormValues>();

	const socialCards = [
		{
			id: "whatsapp",
			icon: ChatBubbleIcon,
			iconBgColor: "#25D366",
			title: t("getStarted.socials.whatsapp.title", {
				defaultValue: "WhatsApp Community",
			}),
			description: t("getStarted.socials.whatsapp.description", {
				defaultValue: "Share updates with your customers instantly",
			}),
			fieldName: "whatsappCommunityUrl",
			placeholder: t("getStarted.socials.whatsapp.placeholder", {
				defaultValue: "https://chat.whatsapp.com/...",
			}),
			badge: t("getStarted.socials.badge.optional", { defaultValue: "Optional" }),
			badgeColor: "default" as const,
		},
		{
			id: "instagram",
			icon: InstagramIcon,
			iconBgColor:
				"linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
			title: t("getStarted.socials.instagram.title", {
				defaultValue: "Instagram",
			}),
			description: t("getStarted.socials.instagram.description", {
				defaultValue: "Connect for live shopping & stories",
			}),
			fieldName: "instagramHandle",
			placeholder: t("getStarted.socials.instagram.placeholder", {
				defaultValue: "@yourstorename",
			}),
			badge: t("getStarted.socials.badge.optional", { defaultValue: "Optional" }),
			badgeColor: "default" as const,
		},
		{
			id: "facebook",
			icon: FacebookIcon,
			iconBgColor: "#1877F2",
			title: t("getStarted.socials.facebook.title", {
				defaultValue: "Facebook Page",
			}),
			description: t("getStarted.socials.facebook.description", {
				defaultValue: "Run ads & go live to your audience",
			}),
			fieldName: "facebookPageId",
			placeholder: t("getStarted.socials.facebook.placeholder", {
				defaultValue: "Your Page ID or URL",
			}),
			badge: t("getStarted.socials.badge.optional", { defaultValue: "Optional" }),
			badgeColor: "default" as const,
		},
		{
			id: "webhook",
			icon: WebhookIcon,
			iconBgColor: "#6366f1",
			title: t("getStarted.socials.webhook.title", {
				defaultValue: "Webhook URL (Zapier/n8n)",
			}),
			description: t("getStarted.socials.webhook.description", {
				defaultValue: "Connect to Zapier, Make, or n8n to automate your workflow",
			}),
			fieldName: "webhookUrl",
			placeholder: t("getStarted.socials.webhook.placeholder", {
				defaultValue: "https://hooks.zapier.com/...",
			}),
			badge: t("getStarted.socials.badge.advanced", { defaultValue: "Advanced" }),
			badgeColor: "default" as const,
		},
	];

	return (
		<Box>
			<Box sx={{ textAlign: "center", mb: 4 }}>
				<Box
					sx={{
						width: 80,
						height: 80,
						borderRadius: 2,
						bgcolor: "#CFF1DE",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						mx: "auto",
						mb: 2,
					}}
				>
					<ChatBubbleIcon sx={{ fontSize: 48, color: "#25D366" }} />
				</Box>
				<Typography variant="h3" textAlign="center" fontWeight={600}>
					{t("getStarted.socials.title", {
						defaultValue: "Connect Your Socials",
					})}
				</Typography>
				<Typography variant="body1" mt={2} color="text.secondary">
					{t("getStarted.socials.subtitle", {
						defaultValue: "Bring customers from everywhere. You can skip and configure later.",
					})}
				</Typography>
			</Box>

			<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				{socialCards.map((card) => {
					const Icon = card.icon;
					return (
						<Card
							key={card.id}
							sx={{
								borderRadius: 2,
								boxShadow: 1,
								position: "relative",
								overflow: "visible",
							}}
						>
							<Chip
								label={card.badge}
								size="small"
								sx={{
									position: "absolute",
									top: 12,
									right: 12,
									height: 24,
									fontSize: "0.7rem",
									bgcolor: "grey.100",
									color: "text.secondary",
								}}
							/>
							<CardContent sx={{ p: 3 }}>
								<Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
									<Box
										sx={{
											width: 56,
											height: 56,
											borderRadius: 1.5,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											background: card.iconBgColor,
											flexShrink: 0,
										}}
									>
										<Icon sx={{ fontSize: 32, color: "white" }} />
									</Box>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Typography variant="h6" fontWeight={600} mb={0.5}>
											{card.title}
										</Typography>
										<Typography variant="body2" color="text.secondary" mb={2}>
											{card.description}
										</Typography>
										<Field
											name={card.fieldName}
											component={TextFormField}
											placeholder={card.placeholder}
											fullWidth
										/>
									</Box>
								</Box>
							</CardContent>
						</Card>
					);
				})}
			</Box>

			<Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
				<Link
					href="https://www.whatsapp.com/community"
					target="_blank"
					rel="noopener noreferrer"
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
						color: "primary.main",
						textDecoration: "none",
						"&:hover": {
							textDecoration: "underline",
						},
					}}
				>
					<OpenInNewIcon sx={{ fontSize: 16 }} />
					<Typography variant="body2">
						{t("getStarted.socials.links.createWhatsApp", {
							defaultValue: "Create WhatsApp Community",
						})}
					</Typography>
				</Link>
				<Link
					href="https://business.instagram.com/getting-started"
					target="_blank"
					rel="noopener noreferrer"
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
						color: "primary.main",
						textDecoration: "none",
						"&:hover": {
							textDecoration: "underline",
						},
					}}
				>
					<OpenInNewIcon sx={{ fontSize: 16 }} />
					<Typography variant="body2">
						{t("getStarted.socials.links.setupInstagram", {
							defaultValue: "Set up Instagram Business",
						})}
					</Typography>
				</Link>
			</Box>
		</Box>
	);
};

export default ConnectSocialsForm;
