import { AutocompleteField } from "./AutoComplete";
export { AutocompleteField as SelectFormField };

// import React from "react";
// import { FieldProps, getIn } from "formik";
// import { MenuItem, FormControl, InputLabel, Typography, TextField } from "@mui/material";
// import { ListDto } from "../../models/ListDto";

// export const SelectFormField: React.FC<
// 	FieldProps & {
// 		label?: string;
// 		required?: boolean;
// 		options: ListDto[];
// 		type?: string;
// 	}
// > = ({ field, form, label, options, ...props }) => {
// 	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);

// 	return (
// 		<FormControl fullWidth error={!!errorText}>
// 			{label && (
// 				<InputLabel sx={{ ml: -1.6 }} shrink htmlFor={field.name}>
// 					<Typography variant="h4" color="text.primary">
// 						{label?.toUpperCase()}
// 					</Typography>
// 				</InputLabel>
// 			)}
// 			<TextField
// 				select
// 				fullWidth
// 				id={field.name}
// 				error={!!errorText}
// 				{...field}
// 				{...props}
// 				placeholder={`Enter ${label}`}
// 				helperText={errorText}
// 				label={undefined}
// 				InputLabelProps={{
// 					shrink: true,
// 				}}
// 			>
// 				<MenuItem value={props.type === "number" ? undefined : ""}>
// 					<Typography color="text.primary">None</Typography>
// 				</MenuItem>
// 				{options.map(({ value, label }) => {
// 					return (
// 						<MenuItem key={value} value={value}>
// 							<Typography color="text.primary">{label}</Typography>
// 						</MenuItem>
// 					);
// 				})}
// 			</TextField>
// 		</FormControl>
// 	);
// };
