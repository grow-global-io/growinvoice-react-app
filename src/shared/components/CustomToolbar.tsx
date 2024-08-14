import {
	useJson2excelControllerCreate,
	useJson2excelControllerCreateCsv,
} from "@api/services/json2excel";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Button, Menu, MenuItem } from "@mui/material";
import { GridToolbarContainer } from "@mui/x-data-grid";
import React from "react";

export function CustomToolbar({
	rows,
}: {
	// eslint-disable-next-line 
	rows: any;
}) {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const creatExcelFile = useJson2excelControllerCreate();
	const handleCreatExcelFile = async () => {
		const response = await creatExcelFile.mutateAsync({ data: rows ?? [] });
		window.open(response?.link);
		handleClose();
	};
	const creatCsvFile = useJson2excelControllerCreateCsv();
	const handleCreatCsvFile = async () => {
		const response = await creatCsvFile.mutateAsync({ data: rows ?? [] });
		window.open(response?.link as string);
		handleClose();
	};
	const menuLists = [
		{
			name: "Download as CSV",
			func: handleCreatCsvFile,
		},
		{
			name: "Download as Excel",
			func: handleCreatExcelFile,
		},
	];

	return (
		<>
			<GridToolbarContainer>
				<Button onClick={handleClick}>
					<FileDownloadOutlinedIcon />
					Export
				</Button>
			</GridToolbarContainer>
			<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
				{menuLists.map((item, index) => (
					<MenuItem onClick={item.func} sx={{ pr: 6 }} key={index}>
						{item.name}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
