import { Box, FormHelperText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
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
	onChangeValue?: (event: SelectChangeEvent) => void;
}) => {
	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.defaultPrevented) {
			return;
		}
	};
	const apiRef = useGridApiContext();

	const onChange = async (event: SelectChangeEvent) => {
		apiRef.current.setEditCellValue({
			id: params.id,
			field: params.field,
			value: event.target.value,
		});
		onChangeValue?.(event);
	};
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
			<Select
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
			</Select>
			{params.error && <FormHelperText error={params.error}>{params.helperText}</FormHelperText>}
		</Box>
	);
};

export default GridSelectField;
