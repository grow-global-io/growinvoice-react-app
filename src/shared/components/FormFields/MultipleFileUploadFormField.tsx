import React from "react";
import { FieldProps, getIn } from "formik";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase";
import { AlertService } from "@shared/services/AlertService";

type UploadFileResponse = {
	filename: string;
	fileurl: string;
	message: string;
	gcsPath: string;
};

const MultipleFileUploadFormField: React.FC<
	FieldProps & {
		label: string;
		required?: boolean;
		accept?: string;
	}
> = ({ field, form, label, accept = "image/*" }) => {
	const [name, setName] = React.useState<string>("");
	const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);
	const [docTypeError, setDocTypeError] = React.useState<boolean>(false);
	const [fileSizeError, setFileSizeError] = React.useState<boolean>(false);
	const [isPending, setIsPending] = React.useState<boolean>(false);

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;

		setDocTypeError(false);
		setFileSizeError(false);
		const files = Array.from(event.target.files);
		setName(files.map((file) => file.name).join(", "));
		// const maxSizeInBytes = 5 * 1024 * 1024;
		const filesurl = [...(field.value || [])];
		for (const file of files) {
			// if (file.size > maxSizeInBytes) {
			// 	setFileSizeError(true);
			// 	return;
			// }
			if (accept === ".pdf" && file.type !== "application/pdf") {
				setDocTypeError(true);
				return;
			}
			const storageRef = ref(storage, `images/${file.name}`);
			const uploadTask = uploadBytesResumable(storageRef, file);
			const response = await new Promise<UploadFileResponse>((resolve, reject) => {
				uploadTask.on(
					"state_changed",
					(snapshot) => {
						const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
						setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
					},
					(error) => {
						console.error("[useFileUpload] uploadFile error:", error);
						AlertService.instance.errorMessage("File upload failed. Please try again.");
						reject(error);
					},
					async () => {
						const url = await getDownloadURL(uploadTask.snapshot.ref);
						resolve({
							filename: file.name,
							fileurl: url,
							gcsPath: uploadTask.snapshot.ref.fullPath,
							message: "File uploaded successfully",
						});

						// if (!props.hideSuccessAlert) {
						// 	ToastService.successMessage("File uploaded successfully");
						// }
					},
				);
			});
			filesurl.push(response.fileurl);
		}
		form.setFieldValue(field.name, filesurl, true);
	};
	console.log(errorText, field.name, form.errors, form.touched);

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
				{...field}
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
									onChange={async (e) => {
										setIsPending(true);
										await handleUpload(e);
										setIsPending(false);
									}}
									type="file"
									accept={accept}
									hidden
									multiple
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
			{isPending && <CircularProgress size={20} color="secondary" />}
			{Object.keys(uploadProgress).map((fileName) => (
				<Box key={fileName} sx={{ mt: 1 }}>
					<Typography variant="body2">{fileName}</Typography>
					<Box sx={{ width: "100%", backgroundColor: "#e0e0e0", borderRadius: 1 }}>
						<Box
							sx={{
								width: `${uploadProgress[fileName]}%`,
								backgroundColor: "primary.main",
								height: 10,
								borderRadius: 1,
							}}
						/>
					</Box>
				</Box>
			))}
		</FormControl>
	);
};

export default MultipleFileUploadFormField;
