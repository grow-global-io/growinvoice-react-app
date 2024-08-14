import React from "react";
import { FieldProps, getIn } from "formik";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";

export const CheckBoxFormField: React.FC<
	FieldProps & {
		label: string;
	}
> = ({ field, form, label, ...props }) => {
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);

	return (
		<FormControl error={!!errorText}>
			<FormControlLabel
				control={<Checkbox checked={field?.value} {...field} {...props} />}
				label={label}
			/>
			{errorText && <FormHelperText>{errorText}</FormHelperText>}
		</FormControl>
	);
};
