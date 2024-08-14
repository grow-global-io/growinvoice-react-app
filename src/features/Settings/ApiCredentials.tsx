import { Grid, TextField, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AlertService } from "@shared/services/AlertService";

const ApiCredentials = () => {
	const token = localStorage?.getItem("authToken");

	return (
		<Grid container spacing={2}>
			<Grid item sm={12}>
				<Typography variant="h4">API Token</Typography>
			</Grid>

			<Grid item xs={12} sm={10}>
				<TextField fullWidth disabled value={token} />
			</Grid>
			<Grid item xs={12} sm={2} gap={2} display={"flex"} alignItems={"center"}>
				<CustomIconButton
					src={ContentCopyIcon}
					onClick={() => {
						navigator.clipboard.writeText(token ?? "");
						AlertService.instance.successMessage("Token copied to clipboard");
					}}
				/>
				<CustomIconButton src={RefreshIcon} buttonType="delete" iconColor="error" />
			</Grid>
			<Grid item sm={12} display={"flex"}>
				<Typography variant="body1" mt={{ md: -2, xs: 1 }}>
					To learn more, check the documentation:
					<Typography
						component="a"
						href="https://growinvoice-94ee0dd2031b.herokuapp.com/docs"
						color="custom.primary"
						sx={{ ml: 1, wordBreak: "break-all" }}
						target="_blank"
					>
						click here
					</Typography>
				</Typography>
			</Grid>
		</Grid>
	);
};

export default ApiCredentials;
