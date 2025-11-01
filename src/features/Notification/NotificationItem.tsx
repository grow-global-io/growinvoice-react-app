import { NotificationDto } from "@api/services/models";
import { ListItem, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotificationItem = ({ data }: { data: NotificationDto }) => {
	const { t } = useTranslation();

	// Translate notification title and body
	const translateNotification = (title: string | undefined, body: string | undefined) => {
		if (!title) return { translatedTitle: "", translatedBody: "" };

		// Translate payment success notifications
		if (title === "Payment Success" || title.toLowerCase().includes("payment success")) {
			const translatedTitle = t("notification.payment.success", {
				defaultValue: "Payment Success",
			});
			// Extract plan name from body if present (matches "plan Free Plan", "plan Basic Plan", etc.)
			let translatedBody = "";
			if (body) {
				const planMatch = body.match(/plan\s+([A-Za-z]+\s?[A-Za-z]*)\s/i);
				if (planMatch) {
					const planName = planMatch[1].toLowerCase().replace(/\s+/g, "");
					const translatedPlanName = t(`plans.planNames.${planName}`, {
						defaultValue: planMatch[1],
					});
					translatedBody = t("notification.payment.successMessage", {
						plan: translatedPlanName,
						defaultValue: `Payment for plan ${translatedPlanName} is successful`,
					});
				} else {
					translatedBody = t("notification.payment.successMessageGeneric", {
						defaultValue: body,
					});
				}
			}
			return { translatedTitle, translatedBody };
		}

		// Default: try to translate if key exists, otherwise return original
		return {
			translatedTitle: t(`notification.${title.toLowerCase().replace(/\s+/g, "")}`, {
				defaultValue: title,
			}),
			translatedBody: body
				? t(`notification.body.${body.toLowerCase().replace(/\s+/g, "")}`, { defaultValue: body })
				: "",
		};
	};

	const { translatedTitle, translatedBody } = translateNotification(data?.title, data?.body);

	return (
		<ListItem sx={{ backgroundColor: data?.read && data?.read === true ? "" : "#f1f1f1" }} divider>
			{/* <ListItemAvatar>
				<Avatar
					sx={{ width: 56, height: 56, textDecoration: "none" }}
					to={`/patients/${data?.userId}`}
					component={Link}
				/>
			</ListItemAvatar> */}
			<ListItemText
				primary={
					<Typography
						variant="h6"
						component="span"
						sx={{ textDecoration: "none", ml: 2 }}
						color="text.secondary"
					>
						{translatedTitle || data?.title}
					</Typography>
				}
				secondary={
					<>
						{data?.title ? (
							<Typography ml={2} color="text.secondary">
								{translatedBody || data?.body}
							</Typography>
						) : data?.title === "Task Alert" ? (
							<Typography
								ml={2}
								color="text.secondary"
								component={Link}
								to={`/collaboration?tab=1`}
								sx={{
									textDecoration: "none",
								}}
							>
								{data?.body ?? t("common.loading", { defaultValue: "Loading..." })}
							</Typography>
						) : (
							<Typography ml={2} color="text.secondary">
								{translatedBody ||
									data?.body ||
									t("common.loading", { defaultValue: "Loading..." })}
							</Typography>
						)}
					</>
				}
			/>
		</ListItem>
	);
};

export default NotificationItem;
