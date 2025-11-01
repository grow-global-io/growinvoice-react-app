import { useUploadControllerUploadFile } from "@api/services/upload";
import { Box, Button, FormControl, InputLabel, Typography } from "@mui/material";
import { FieldProps, getIn } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";

const AvatarFormField: React.FC<
	FieldProps & {
		label?: string;
		required?: boolean;
		isRequired?: boolean;
		type?: string;
		backgroundColor?: string; // New prop for background color
	}
> = ({ field, form, label, isRequired }) => {
	const { t } = useTranslation();
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);
	const [fileSizeError, setFileSizeError] = React.useState<boolean>(false);
	const [docTypeError, setDocTypeError] = React.useState<boolean>(false);
	const { mutateAsync } = useUploadControllerUploadFile();

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setDocTypeError(false);
		setFileSizeError(false);
		if (!event.target.files) return;
		const file = event.target.files[0];
		const maxSizeInBytes = 5 * 1024 * 1024;
		if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
			setDocTypeError(true);
			return;
		}
		if (file.size > maxSizeInBytes) {
			setFileSizeError(true);
			return;
		}
		const uploadRes = await mutateAsync({
			data: {
				file,
			},
		});
		form.setFieldValue(field.name, uploadRes.link, true);
	};

	return (
		<FormControl fullWidth error={!!errorText}>
			{label && (
				<InputLabel sx={{ ml: -1.6 }} shrink htmlFor={field.name}>
					<Typography variant="h4" color="text.primary">
						{label?.toUpperCase()}
						{isRequired && (
							<Typography variant="h5" color="error" component="span">
								{" *"}
							</Typography>
						)}
					</Typography>
				</InputLabel>
			)}
			<Box
				sx={{
					display: "flex",
					alignItems: "end",
				}}
			>
				<img
					src={field?.value}
					alt={t("app.avatarAlt", { defaultValue: "avatar" })}
					style={{ width: "100px", height: "100px", borderRadius: "50%", marginTop: "20px" }}
				/>
				<Button variant="outlined" component="label">
					{t("app.uploadFile", { defaultValue: "Upload File" })}
					<input type="file" hidden onChange={handleUpload} />
				</Button>
				{field.value && (
					<Button
						variant="outlined"
						color="error"
						onClick={() => {
							form.setFieldValue(field.name, "", true);
						}}
					>
						{t("app.remove", { defaultValue: "Remove" })}
					</Button>
				)}
			</Box>
			{fileSizeError && (
				<Typography variant="caption" color="error">
					{t("upload.errors.maxSize", { defaultValue: "Maximum file size is 5MB" })}
				</Typography>
			)}
			{docTypeError && (
				<Typography variant="caption" color="error">
					{t("upload.errors.invalidType", {
						defaultValue: "Only .png, .jpg, .jpeg files are allowed",
					})}
				</Typography>
			)}
		</FormControl>
	);
};

export default AvatarFormField;
