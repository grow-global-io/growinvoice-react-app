import React from "react";
import { FieldProps, getIn } from "formik";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ListDto } from "../../models/ListDto";
import { useQuery } from "@tanstack/react-query";
import { useDebounceValue } from "usehooks-ts";
import { http } from "@shared/axios";

const transformData = (data: unknown) => {
	if (!Array.isArray(data)) {
		return [];
	}
	return data.map((item: unknown): ListDto => {
		if (typeof item === "string") {
			return { label: item, value: item };
		}
		if (
			typeof item === "object" &&
			item !== null &&
			"label" in item &&
			"value" in item &&
			typeof item.label === "string" &&
			typeof item.value === "string"
		) {
			return { label: item.label, value: item.value };
		}
		return { label: "", value: "" };
	});
};

function AsyncAutoCompleteField({
	field,
	form,
	label,
	optionUrl,
	onValueChange,
	isRequired,
	isGpt,
	...props
}: FieldProps & {
	label: string;
	required?: boolean;
	optionUrl: string;
	isRequired?: boolean;
	isGpt?: boolean;
	onValueChange?: (value: ListDto) => void;
}) {
	const [typedData, setTypedData] = React.useState<ListDto>();
	const [debouncedInputValue, setSearchTerm] = useDebounceValue("", 500);

	const { data = [], isLoading } = useQuery({
		queryKey: ["autocomplete", optionUrl, debouncedInputValue],
		queryFn: async () => {
			if (
				typedData?.value?.toString()?.toLowerCase() ===
					debouncedInputValue?.toString()?.toLowerCase() &&
				isGpt
			) {
				return [];
			}
			const params = new URLSearchParams();
			if (debouncedInputValue) {
				params.append("q", debouncedInputValue);
			}
			const { data } = await http.get(optionUrl, { params });
			return transformData(data);
		},
	});

	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);
	return (
		<FormControl fullWidth error={!!errorText}>
			{field.name && (
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
			<Autocomplete
				{...props}
				id={field.name}
				filterOptions={(x) => x}
				filterSelectedOptions
				options={
					[
						...(typedData && isGpt ? [typedData] : []),
						...data.filter((option) => !typedData || option.value !== typedData.value),
					] as ListDto[]
				}
				loading={isLoading}
				onChange={(_, value) => {
					if (value === null) {
						form.setFieldValue(field.name, "");
					}
					if (value) {
						form.setFieldValue(field.name, value.value);
						onValueChange?.(value);
					}
				}}
				onInputChange={(_, value, reason) => {
					if (reason === "input") {
						setSearchTerm(value);
						if (isGpt) {
							setTypedData({ label: value, value });
							form.setFieldValue(field.name, value);
						}
					} else if (reason === "clear") {
						setSearchTerm("");
					}
				}}
				renderOption={(props, option) => {
					return (
						<li {...props} key={option.value}>
							<Typography>{option.label}</Typography>
						</li>
					);
				}}
				renderInput={(params) => (
					<TextField
						placeholder={label ? `Enter ${label?.toLowerCase()}` : undefined}
						error={Boolean(errorText)}
						helperText={errorText}
						label={undefined}
						name={field.name}
						{...params}
					/>
				)}
				value={data.find((option) => option.value === field.value) ?? field.value ?? null}
			/>
		</FormControl>
	);
}

export const AutocompleteField: React.FC<
	FieldProps & {
		label: string;
		required?: boolean;
		options?: ListDto[];
		optionUrl?: string;
		onValueChange?: (value: ListDto) => void;
		multiple?: boolean;
		isRequired?: boolean;
		isGpt?: boolean;
	}
> = ({
	field,
	form,
	label,
	options = [],
	optionUrl,
	onValueChange,
	isRequired,
	isGpt,
	...props
}) => {
	const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);

	if (optionUrl) {
		return (
			<AsyncAutoCompleteField
				field={field}
				form={form}
				label={label}
				required={props.required}
				optionUrl={optionUrl}
				onValueChange={onValueChange}
				isRequired={isRequired}
				isGpt={isGpt}
				{...props}
			/>
		);
	}

	return (
		<FormControl fullWidth error={!!errorText}>
			{field.name && (
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
			<Autocomplete
				{...props}
				filterSelectedOptions
				id={field.name}
				options={options}
				onChange={(_, value) => {
					if (value === null) {
						form.setFieldValue(field.name, "");
						onValueChange?.(undefined as unknown as ListDto);
					}
					if (value) {
						if (Array.isArray(value)) {
							form.setFieldValue(
								field.name,
								value.map((v) => (v as ListDto)?.value),
							);
							if (form.values[field.name].length === 0) {
								onValueChange?.(value[0] as ListDto);
							} else {
								const data: ListDto[] = [];
								value.map((obj) => {
									if (!(form.values[field.name].indexOf(obj.value) !== -1)) {
										data.push(obj);
									}
									return data;
								});
								onValueChange?.(data[0] as ListDto);
							}
						} else {
							form.setFieldValue(field.name, (value as ListDto)?.value);
							onValueChange?.(value as ListDto);
						}
					}
				}}
				renderOption={(props, option) => {
					return (
						<li {...props} key={option.value}>
							<Typography>{option.label}</Typography>
						</li>
					);
				}}
				renderInput={(params) => (
					<TextField
						autoComplete="off"
						error={Boolean(errorText)}
						helperText={errorText}
						placeholder={label ? `Enter ${label?.toLowerCase()}` : undefined}
						label={undefined}
						name={field.name}
						{...params}
					/>
				)}
				value={
					props.multiple
						? (options.filter((option) => field.value?.includes(option.value)) ?? [])
						: (options.find((option) => option.value === field.value) ?? null)
				}
				onBlur={field.onBlur}
			/>
		</FormControl>
	);
};
