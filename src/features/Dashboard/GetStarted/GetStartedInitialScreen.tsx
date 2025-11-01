import { Box, Typography } from "@mui/material";
import { Constants } from "@shared/constants";
import { useTranslation } from "react-i18next";

const GetStartedInitialScreen = () => {
	const { t } = useTranslation();
	return (
		<Box>
			<img src={Constants.customImages.GetStartedImage} width={"230px"} />
			<Typography variant="h3">
				{t("getStarted.initial.title", { defaultValue: "Almost There! Just a Few Details" })}
			</Typography>
			<Typography variant="h5" fontWeight={500}>
				{t("getStarted.initial.subtitle", {
					defaultValue:
						"Just enter a few details like currency and company information to start creating your invoices in no time!",
				})}
			</Typography>
		</Box>
	);
};

export default GetStartedInitialScreen;
