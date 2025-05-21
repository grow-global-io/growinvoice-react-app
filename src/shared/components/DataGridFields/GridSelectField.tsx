import { Autocomplete, Box, FormHelperText, SelectChangeEvent, TextField } from "@mui/material";
import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import { ListDto } from "@shared/models/ListDto";

const GridSelectField = ({
	params,
	valueOptions,
	disabled = false,
	onChangeValue,
}: {
	params: GridRenderEditCellParams;
	valueOptions?: ListDto[];
	disabled?: boolean;
	onChangeValue?: (event: SelectChangeEvent,value?: string) => void;
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
				disabled={disabled}
				options={optionsValues ?? []}
				getOptionLabel={(option) => option.label}
				onChange={(event, value) => {
					console.log("value", value);
					apiRef.current.setEditCellValue({
						id: params.id,
						field: params.field,
						value: value?.value,
					});
					onChangeValue?.(event, value?.value as string	);
				}}
				renderInput={(params) => (
					<TextField
						{...params}
						fullWidth
						/>
				)}
				value={optionsValues?.find((option) => option.value === params.value) ?? null}
				isOptionEqualToValue={(option, value) => option.value === value.value}
				
				/>
			{/* <Select
				value={params.value}
				onKeyDown={onKeyDown}
				onChange={onChange}
				disabled={disabled}
				fullWidth
				error={params.error}
			>
				{optionsValues?.map((option) => {
					return (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem> 
					);
				})}
			</Select> */}
			{params.error && <FormHelperText error={params.error}>{params.helperText}</FormHelperText>}
		</Box>
	);
};

export default GridSelectField;
