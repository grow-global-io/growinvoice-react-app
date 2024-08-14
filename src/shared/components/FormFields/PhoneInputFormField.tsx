import React, { forwardRef } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import PhoneInput from "react-phone-number-input";
import { FieldProps, getIn } from "formik";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import "react-phone-number-input/style.css";

const phoneInput = (props: TextFieldProps, ref: React.Ref<HTMLInputElement>) => {
	return <TextField {...props} inputRef={ref} sx={{ mt: 2 }} />;
};

const CustomPhoneInput = forwardRef(phoneInput);

export const PhoneInputFormField: React.FC<
	FieldProps & {
		label?: string;
		required?: boolean;
	}
> = ({ field, form, label, ...props }) => {
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);

	return (
		<FormControl fullWidth error={!!errorText}>
			{label && (
				<InputLabel sx={{ ml: -1.6 }} shrink htmlFor={field.name}>
					<Typography variant="h4" color="text.primary">
						{label?.toUpperCase()}
					</Typography>
				</InputLabel>
			)}
			<PhoneInput
				limitMaxLength
				addInternationalOption={false}
				defaultCountry="IN"
				inputComponent={CustomPhoneInput}
				fullWidth
				id={field.name}
				error={!!errorText}
				placeholder={label ? `Enter ${label?.toLowerCase()}` : undefined}
				helperText={errorText}
				label={undefined}
				InputLabelProps={{
					shrink: true,
				}}
				{...field}
				onChange={(value) => {
					if (value) {
						form.setFieldValue(field.name, value);
					}
				}}
				{...props}
			/>
		</FormControl>
	);
};
