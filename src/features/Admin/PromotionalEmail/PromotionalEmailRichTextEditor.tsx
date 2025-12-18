import { type FieldProps, getIn } from "formik";
import * as React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import SunEditor from "suneditor-react";
import { styled } from "@mui/material";
import i18n from "i18next";
import type { SunEditorOptions } from "suneditor/src/options";

const StyledSunEditor = styled(SunEditor)(({ theme }) => ({
	mb: theme.spacing(1),
}));

export const PromotionalEmailRichTextEditor: React.FC<
	FieldProps & {
		label?: string;
		required?: boolean;
		editorOptions?: SunEditorOptions;
		values?: any;
		setFieldValue?: (field: string, value: any) => void;
		convertToBase64?: (file: File) => Promise<string>;
		generateCID?: (filename: string) => string;
		toast?: any;
	}
> = ({
	field,
	form,
	label,
	values,
	setFieldValue,
	convertToBase64,
	generateCID,
	toast,
	...props
}) => {
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);

	// Create custom editor options with image upload handler
	const customEditorOptions = React.useMemo(() => {
		const baseOptions = props.editorOptions || {};

		return {
			...baseOptions,
			imageUploadSizeLimit: 5 * 1024 * 1024, // 5MB
			onImageUploadBefore: (files: File[], _info: any, uploadHandler: any) => {
				const processImages = async () => {
					const newAttachmentsList = [];
					const results = [];

					// Get current attachments at the start of processing
					const initialAttachments = form.values.attachments || [];

					for (const file of files) {
						try {
							if (convertToBase64 && generateCID) {
								const base64Content = await convertToBase64(file);
								const cid = generateCID(file.name);

								newAttachmentsList.push({
									filename: file.name,
									content: base64Content,
									contentType: file.type,
									cid: cid,
								});

								results.push({
									url: `cid:${cid}`,
									name: file.name,
									size: file.size,
								});

								if (toast) {
									toast.success(`Image added: ${file.name}`);
								}
							}
						} catch (error) {
							console.error("Error uploading image:", error);
							if (toast) {
								toast.error(`Failed to upload ${file.name}`);
							}
						}
					}

					// Set all new attachments at once to avoid stale state issues
					if (setFieldValue && newAttachmentsList.length > 0) {
						setFieldValue("attachments", [...initialAttachments, ...newAttachmentsList]);
					}

					// Many SunEditor versions expect { result: [...] }
					uploadHandler({ result: results });
				};
				processImages();
				return false; // Prevent default upload
			},
		};
	}, [props.editorOptions, values, setFieldValue, convertToBase64, generateCID, toast]);

	return (
		<FormControl fullWidth error={!!errorText}>
			{label && (
				<InputLabel sx={{ ml: -1.6, mb: 10 }} shrink htmlFor={field.name}>
					<Typography variant="h4" color="text.primary">
						{label?.toUpperCase()}
						<br></br>
					</Typography>
				</InputLabel>
			)}
			<br />
			<StyledSunEditor
				name={field.name}
				width="100%"
				height="200px"
				setContents={field.value}
				placeholder={i18n.t("common.typeHere", { defaultValue: "Please type here..." })}
				onChange={(data) => form.setFieldValue(field.name, data, true)}
				onBlur={field.onBlur}
				setOptions={customEditorOptions}
			/>
			<FormHelperText>{errorText}</FormHelperText>
		</FormControl>
	);
};
