import React, { useState } from "react";
import { type FieldProps, getIn } from "formik";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useTranslation } from "react-i18next";

export const TextFormField: React.FC<
	FieldProps & {
		label?: string;
		required?: boolean;
		isRequired?: boolean;
		type?: string;
		backgroundColor?: string; // New prop for background color
		marginWholeTop?: number;
	}
> = ({ field, form, label, backgroundColor, isRequired, marginWholeTop, ...props }) => {
	const { t } = useTranslation();
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);
	const [hidePassword, setHidePassword] = useState(true);
	const handleClickHidePassword = () => setHidePassword((hide) => !hide);
	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	return (
		<FormControl
			fullWidth
			error={!!errorText}
			sx={marginWholeTop ? { mt: marginWholeTop } : undefined}
		>
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
			<TextField
				{...field}
				fullWidth
				id={field.name}
				error={!!errorText}
				placeholder={
					label
						? t("common.enter", { label: label?.toLowerCase(), defaultValue: "Enter {{label}}" })
						: undefined
				}
				InputProps={{
					endAdornment: props.type === "password" && (
						<InputAdornment position="end">
							<IconButton
								aria-label="toggle password visibility"
								onClick={handleClickHidePassword}
								onMouseDown={handleMouseDownPassword}
								edge="end"
							>
								{hidePassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
							</IconButton>
						</InputAdornment>
					),
					style: { backgroundColor: backgroundColor || "transparent" }, // Conditional background color
				}}
				{...props}
				type={
					props.type === "password" && hidePassword
						? "password"
						: props.type === "password" && !hidePassword
							? "text"
							: props.type
				}
				helperText={errorText}
				label={undefined}
				InputLabelProps={{
					shrink: true,
				}}
				hidden={true}
				onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
					// For number fields, select the value if it's 0 so user can type directly
					if (props.type === "number") {
						const value = e.target.value;
						if (value === "0" || value === "0.00" || value === "0.0") {
							e.target.select();
						}
					}
					// Call any custom onFocus handler if provided
					if (props.onFocus) {
						props.onFocus(e);
					}
				}}
				onBlur={(e) => {
					form.handleBlur(e);
					if (props?.type === "number") {
						const value = e.target.value;
						// Allow empty values - don't force 0 if user cleared the field
						if (value === "" || value === null || value === undefined) {
							form.setFieldValue(field.name, "");
							e.target.value = "";
						} else {
							const numberValue = parseFloat(value);
							if (!isNaN(numberValue)) {
								form.setFieldValue(field.name, numberValue);
								e.target.value = numberValue.toString();
							}
						}
					}
				}}
			/>
		</FormControl>
	);
};
