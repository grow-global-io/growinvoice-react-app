import { useAuthStore } from "@store/auth";
import { Alert, AlertTitle, Button } from "@mui/material";
import { useGetStartedDialogStore } from "@store/useGetStartedDialog";
import GetStartedDialog from "../../features/Dashboard/GetStartedDialog";
import { useTranslation } from "react-i18next";

const GetStartedErrorComp = () => {
	const { t } = useTranslation();
	const { isGetStartedDialogOpen } = useAuthStore();
	const { handleOpen } = useGetStartedDialogStore();
	return (
		<>
			<GetStartedDialog />
			{isGetStartedDialogOpen() && (
				<Alert
					severity="warning"
					action={
						<Button
							color="warning"
							onClick={() => {
								handleOpen();
							}}
							size="small"
							variant="contained"
							sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2 }}
						>
							{t("getStarted.banner.cta", { defaultValue: "Quick Setup (30s)" })}
						</Button>
					}
					sx={{
						mb: 2,
						borderRadius: 2,
						"& .MuiAlert-icon": {
							display: "flex",
							alignItems: "center",
						},
						"& .MuiAlert-action": {
							display: "flex",
							alignItems: "center",
						},
					}}
				>
					<AlertTitle
						sx={{
							fontWeight: "bold",
							fontSize: "0.95rem",
							padding: 0,
							margin: 0,
						}}
					>
						{t("getStarted.banner.title", { defaultValue: "Complete Business Setup" })}
					</AlertTitle>
					{t("getStarted.banner.message", {
						defaultValue: "Set up your business name and currency to create professional invoices in seconds.",
					})}
				</Alert>
			)}
		</>
	);
};

export default GetStartedErrorComp;
