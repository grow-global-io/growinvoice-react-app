import { useAuthStore } from "@store/auth";
import { Alert, AlertTitle, Button } from "@mui/material";
import { useGetStartedDialogStore } from "@store/useGetStartedDialog";
import GetStartedDialog from "../../features/Dashboard/GetStartedDialog";

const GetStartedErrorComp = () => {
	const { isGetStartedDialogOpen } = useAuthStore();
	const { handleOpen } = useGetStartedDialogStore();
	return (
		<>
			<GetStartedDialog />
			{isGetStartedDialogOpen() && (
				<Alert
					severity="error"
					action={
						<Button
							color="error"
							onClick={() => {
								handleOpen();
							}}
							size="small"
							variant="contained"
						>
							Get Started
						</Button>
					}
					sx={{
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
							textTransform: "uppercase",
							padding: 0,
							margin: 0,
						}}
					>
						Action Required
					</AlertTitle>
					You need to complete the get started process before using this feature.
				</Alert>
			)}
		</>
	);
};

export default GetStartedErrorComp;
