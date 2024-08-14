import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { useConfirmDialogStore } from "@store/confirmDialog";
import InfoIcon from "@mui/icons-material/InfoOutlined";

export default function ConfirmDialog() {
	const {
		open,
		message,
		title,
		onCancel,
		onConfirm,
		cleanUp,
		confirmButtonText,
		cancelButtonText,
	} = useConfirmDialogStore();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onConfirm?.();
		useConfirmDialogStore.setState({ result: true });
		cleanUp();
	};

	const handleClose = () => {
		onCancel?.();
		useConfirmDialogStore.setState({ result: false });
		cleanUp();
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
			<form onSubmit={handleSubmit}>
				<DialogContent>
					<Box
						sx={{
							padding: "0 0 0",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							flexDirection: "column",
						}}
					>
						<InfoIcon sx={{ fontSize: 100 }} color="warning" />
						{title && (
							<Typography variant="body1" sx={{ mt: 2, fontSize: "24px" }}>
								{title}
							</Typography>
						)}
						<Typography variant="body2" sx={{ mt: 2, fontSize: "16px" }}>
							{message}
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions>
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							width: "100%",
						}}
					>
						<Button variant="contained" color="error" sx={{ mt: 2, mr: 2 }} type="submit">
							{confirmButtonText}
						</Button>
						<Button
							variant="outlined"
							color="error"
							sx={{ mt: 2 }}
							type="button"
							onClick={handleClose}
						>
							{cancelButtonText}
						</Button>
					</Box>
				</DialogActions>
			</form>
		</Dialog>
	);
}
