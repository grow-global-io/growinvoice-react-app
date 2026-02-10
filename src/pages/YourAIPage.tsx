import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import YourAIChat from "@features/YourAI/YourAIChat";

const YourAIPage = () => {
	const { t } = useTranslation();
	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<Typography variant="h5" sx={{ mb: 1 }}>
				{t("dashboard.yourAi", { defaultValue: "Your AI" })}
			</Typography>
			<YourAIChat />
		</Box>
	);
};

export default YourAIPage;
