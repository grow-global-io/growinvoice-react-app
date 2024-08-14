import React from "react";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default function AppDialogFooter({
	onClickCancel,
	cancelButtonText = "Cancel",
	saveButtonText = "Save",
	saveButtonDisabled = false,
	cancelButtonDisabled = false,
	children,
}: {
	onClickCancel: () => void;
	cancelButtonText?: string;
	saveButtonText?: string;
	saveButtonDisabled?: boolean;
	cancelButtonDisabled?: boolean;
	children?: React.ReactNode;
}) {
	return (
		<DialogActions
			sx={{
				display: "flex",
				justifyContent: "center",
				m: 0,
				p: 2,
			}}
		>
			{children}
			<Button
				variant="outlined"
				disabled={cancelButtonDisabled}
				color="secondary"
				onClick={onClickCancel}
			>
				{cancelButtonText}
			</Button>
			<Button variant="contained" disabled={saveButtonDisabled} color="primary" type="submit">
				{saveButtonText}
			</Button>
		</DialogActions>
	);
}
