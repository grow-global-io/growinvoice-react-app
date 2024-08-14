import React from "react";
import { FieldProps, getIn } from "formik";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import { useUploadControllerUploadFile } from "@api/services/upload";

export const FileUploadFormField: React.FC<
	FieldProps & {
		label: string;
		required?: boolean;
		accept?: string;
	}
> = ({ field, form, label, accept = "image/*" }) => {
	const [name, setName] = React.useState<string>("");
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);
	const [docTypeError, setDocTypeError] = React.useState<boolean>(false);
	const [fileSizeError, setFileSizeError] = React.useState<boolean>(false);
	// const { mutateAsync, isLoading } = useDoctorsControllerUploadedFile();
	const { mutateAsync, isPending } = useUploadControllerUploadFile();

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;
		setDocTypeError(false);
		setFileSizeError(false);
		const file = event.target.files[0];
		setName(file.name);
		const maxSizeInBytes = 5 * 1024 * 1024;
		if (file.size > maxSizeInBytes) {
			setFileSizeError(true);
			return;
		}
		if (accept === ".pdf" && file.type !== "application/pdf") {
			setDocTypeError(true);
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
			{field.name && (
				<InputLabel sx={{ ml: -1.6 }} shrink htmlFor={field.name}>
					<Typography variant="h4" color="text.primary">
						{label?.toUpperCase()}
					</Typography>
				</InputLabel>
			)}
			<TextField
				fullWidth
				error={!!errorText}
				value={name}
				onChange={(event) => setName(event.target.value)}
				placeholder={`Upload ${label?.toLowerCase() ?? "file"}`}
				helperText={errorText}
				label={undefined}
				InputLabelProps={{
					shrink: true,
				}}
				InputProps={{
					readOnly: true,
					endAdornment: (
						<Box component="span" display="flex" gap={0.5}>
							<IconButton component="label">
								<FileUploadOutlinedIcon />
								<input
									onChange={handleUpload}
									type="file"
									accept={accept}
									hidden
									style={{ display: "none" }}
								/>
							</IconButton>
							{field.value && (
								<IconButton
									onClick={() => {
										setName("");
										return form.setFieldValue(field.name, undefined, true);
									}}
								>
									<ClearIcon />
								</IconButton>
							)}
						</Box>
					),
				}}
			/>
			{fileSizeError && (
				<Typography variant="caption" color="error">
					Maximum file size is 5MB
				</Typography>
			)}
			{docTypeError && (
				<Typography variant="caption" color="error">
					Only PDF files are allowed
				</Typography>
			)}
			{field.value && (
				<Link href={field.value} target="_blank" rel="noopener noreferrer" color="text.secondary">
					File Link
				</Link>
			)}
			{isPending && <CircularProgress size={20} color="secondary" />}
		</FormControl>
	);
};
