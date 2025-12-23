import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ThankYouForm = () => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				textAlign: "center",
				py: 6,
				minHeight: "300px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Box
				sx={{
					width: 100,
					height: 100,
					borderRadius: "50%",
					bgcolor: "success.light",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					mx: "auto",
					mb: 3,
				}}
			>
				<CheckCircleIcon sx={{ fontSize: 60, color: "success.main" }} />
			</Box>
			<Typography variant="h3" fontWeight={600} mb={2}>
				{t("getStarted.thankYou.title", {
					defaultValue: "Thank You!",
				})}
			</Typography>
			<Typography
				variant="h6"
				color="text.secondary"
				fontWeight={400}
				sx={{ maxWidth: "500px", mx: "auto", px: 2 }}
			>
				{t("getStarted.thankYou.message", {
					defaultValue:
						"You've successfully completed the onboarding process. Your account is now set up and ready to use!",
				})}
			</Typography>
		</Box>
	);
};

export default ThankYouForm;
