import { FieldProps, getIn } from "formik";
import * as React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import SunEditor from "suneditor-react";
import { styled } from "@mui/material";
import { SunEditorOptions } from "suneditor/src/options";

const StyledSunEditor = styled(SunEditor)(({ theme }) => ({
	mb: theme.spacing(1),
}));

export const RichTextEditor: React.FC<
	FieldProps & {
		label?: string;
		required?: boolean;
		editorOptions?: SunEditorOptions;
	}
> = ({ field, form, label, ...props }) => {
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);
	// const toolbarOptions: SunEditorOptions = {
	// 	buttonList: [
	// 		["undo", "redo"],
	// 		["bold", "underline", "italic"],
	// 		["align", "list", "table"],
	// 		["image", "fullScreen", "preview", "print", "template"],
	// 	],
	// 	toolbarWidth: "100%", // Specify the desired width of the toolbar
	// };
	// let options: SunEditorOptions;
	// if (!editorOptions) {
	// 	options = toolbarOptions;
	// } else {
	// 	options = editorOptions;
	// }

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
				// getSunEditorInstance={services.getSunEditorInstance}
				name={field.name}
				width="100%"
				height="200px"
				setContents={field.value}
				placeholder="Please type here..."
				onChange={(data) => form.setFieldValue(field.name, data, true)}
				onBlur={field.onBlur}
				{...props}
			/>
			<FormHelperText>{errorText}</FormHelperText>
		</FormControl>
	);
};
