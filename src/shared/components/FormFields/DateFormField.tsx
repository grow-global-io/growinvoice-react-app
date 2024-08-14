import React from "react";
import { FieldProps, getIn } from "formik";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DesktopDatePicker as DatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { InputLabel, TextField, Typography, Box } from "@mui/material";
import moment from "moment";

export const DateFormField: React.FC<
	FieldProps & {
		requiredCancel?: boolean;
		label?: string;
		minDate?: Date;
		maxDate?: Date;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
		isRequired?: boolean;
	}
> = ({
	field,
	form,
	label,
	minDate,
	requiredCancel,
	disabled,
	maxDate,
	onValueChange,
	isRequired,
	...props
}) => {
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);
	const [inputValue, setInputValue] = React.useState<string | null>(
		field.value ? moment(field.value).format("YYYY-MM-DD") : null,
	);

	return (
		<Box sx={{ mt: 0.4 }}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				{label && (
					<InputLabel shrink htmlFor={field.name}>
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
				<DatePicker
					onChange={(value) => {
						if (value && moment.isMoment(value) && value.isValid()) {
							form.setFieldValue(field.name, moment(value).format("YYYY-MM-DD"), true);
							onValueChange?.(moment(value).format("YYYY-MM-DD"));
							setInputValue(moment(value).format("MM/DD/YYYY"));
						} else {
							form.setFieldValue(field.name, null, true);
						}
					}}
					minDate={minDate}
					maxDate={maxDate}
					value={inputValue}
					renderInput={(params) => (
						<TextField
							{...params}
							id={field.name}
							error={Boolean(errorText)}
							helperText={errorText}
							fullWidth
							{...field}
							{...props}
							label={undefined}
							InputLabelProps={{
								shrink: true,
							}}
							sx={{
								"label + &": {
									marginTop: -0.7,
								},
								mb: 1.5,
							}}
							disabled={disabled}
						/>
					)}
					inputFormat="MM/DD/YYYY"
					componentsProps={
						requiredCancel
							? {}
							: {
									actionBar: {
										actions: ["today", "cancel"],
									},
								}
					}
					disabled={disabled}
				/>
			</LocalizationProvider>
		</Box>
	);
};
