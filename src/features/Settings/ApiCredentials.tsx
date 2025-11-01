import { Grid, TextField, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AlertService } from "@shared/services/AlertService";
import { environment } from "@enviroment";
import { useTranslation } from "react-i18next";

const ApiCredentials = () => {
	const { t } = useTranslation();
	const token = localStorage?.getItem("authToken");

	return (
		<Grid container spacing={2}>
			<Grid item sm={12}>
				<Typography variant="h4">
					{t("apiCredentials.token", { defaultValue: "API Token" })}
				</Typography>
			</Grid>

			<Grid item xs={12} sm={10}>
				<TextField fullWidth disabled value={token} />
			</Grid>
			<Grid item xs={12} sm={2} gap={2} display={"flex"} alignItems={"center"}>
				<CustomIconButton
					src={ContentCopyIcon}
					onClick={() => {
						navigator.clipboard.writeText(token ?? "");
						AlertService.instance.successMessage(
							t("apiCredentials.copied", { defaultValue: "Token copied to clipboard" }),
						);
					}}
				/>
				<CustomIconButton src={RefreshIcon} buttonType="delete" iconColor="error" />
			</Grid>
			<Grid item sm={12} display={"flex"}>
				<Typography variant="body1" mt={{ md: -2, xs: 1 }}>
					{t("apiCredentials.learnMore", {
						defaultValue: "To learn more, check the documentation:",
					})}
					<Typography
						component="a"
						href={environment.baseUrl + "/docs"}
						color="custom.primary"
						sx={{ ml: 1, wordBreak: "break-all" }}
						target="_blank"
					>
						{t("apiCredentials.clickHere", { defaultValue: "click here" })}
					</Typography>
				</Typography>
			</Grid>
		</Grid>
	);
};

export default ApiCredentials;
