import React from "react";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";

export default function AppDialogFooter({
	onClickCancel,
	cancelButtonText,
	saveButtonText,
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
	const { t } = useTranslation();
	const resolvedCancel = cancelButtonText ?? t("app.cancel", { defaultValue: "Cancel" });
	const resolvedSave = saveButtonText ?? t("app.save", { defaultValue: "Save" });
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
				{resolvedCancel}
			</Button>
			<Button variant="contained" disabled={saveButtonDisabled} color="primary" type="submit">
				{resolvedSave}
			</Button>
		</DialogActions>
	);
}
