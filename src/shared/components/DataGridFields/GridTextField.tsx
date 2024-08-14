import { TextField } from "@mui/material";
import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import React from "react";

const GridTextField = ({
	params,
	label,
	type = "text",
	onChangeValue,
	disabled = false,
	value,
}: {
	params: GridRenderEditCellParams;
	label: string;
	type?: React.HTMLInputTypeAttribute;
	disabled?: boolean;
	onChangeValue?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	value?: string | number | null | undefined;
}) => {
	const apiRef = useGridApiContext();

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		apiRef.current.setEditCellValue(
			{
				id: params.id,
				field: params.field,
				value: type === "number" ? parseFloat(event.target.value) : event.target.value,
			},
			event,
		);
		onChangeValue?.(event);
	};

	return (
		<TextField
			placeholder={label}
			value={value ?? params.value}
			onChange={handleChange}
			fullWidth
			error={params.error}
			type={type}
			disabled={disabled}
		/>
	);
};

export default GridTextField;
