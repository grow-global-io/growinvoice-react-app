import {
	Autocomplete,
	Box,
	FormHelperText,
	type SelectChangeEvent,
	TextField,
} from "@mui/material";
import { type GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import { type ListDto } from "@shared/models/ListDto";

const GridMultiSelectField = ({
	params,
	valueOptions,
	disabled = false,
	onChangeValue,
}: {
	params: GridRenderEditCellParams;
	valueOptions?: ListDto[];
	disabled?: boolean;
	onChangeValue?: (event: SelectChangeEvent, value?: string[]) => void;
}) => {
	// const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
	// 	if (event.defaultPrevented) {
	// 		return;
	// 	}
	// };
	const apiRef = useGridApiContext();

	// const onChange = async (event: SelectChangeEvent) => {
	// 	apiRef.current.setEditCellValue({
	// 		id: params.id,
	// 		field: params.field,
	// 		value: event.target.value,
	// 	});
	// 	onChangeValue?.(event);
	// };
	const optionsValues = valueOptions;

	return (
		<Box
			sx={{
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
			}}
		>
			<Autocomplete
				sx={{
					marginTop: 0.2,
				}}
				multiple
				filterSelectedOptions
				disabled={disabled}
				options={optionsValues ?? []}
				getOptionLabel={(option) => option.label}
				onChange={(event, value) => {
					if (!value || value.length === 0) {
						apiRef.current.setEditCellValue({
							id: params.id,
							field: params.field,
							value: [],
						});
						// eslint-disable-next-line
						onChangeValue?.(event as any, []);
						return;
					}
					apiRef.current.setEditCellValue({
						id: params.id,
						field: params.field,
						value: value?.map((item) => item.value), // Adjusted to handle multiple values
					});
					onChangeValue?.(
						// eslint-disable-next-line
						event as any,
						value?.map((item) => item.value as string),
					); // Adjusted to handle multiple values
				}}
				renderInput={(params) => <TextField {...params} fullWidth />}
				value={
					Array.isArray(params.value)
						? (optionsValues?.filter((option) => params.value.includes(option.value)) ?? [])
						: []
				}
				isOptionEqualToValue={(option, value) => option.value === value.value}
			/>
			{params.error && <FormHelperText error={params.error}>{params.helperText}</FormHelperText>}
		</Box>
	);
};

export default GridMultiSelectField;
