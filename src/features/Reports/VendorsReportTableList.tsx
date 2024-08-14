import Box from "@mui/material/Box";
import { GridColDef } from "@mui/x-data-grid";
import ProductReportsData from "./../../data/VendorsReportData.json";
import { DataGrid } from "@mui/x-data-grid";
import { Typography } from "@mui/material";

const expenseData = ProductReportsData;

const columns: GridColDef[] = [
	{
		field: "vendorName",
		headerName: "Vendor Name",
		flex: 1,
		renderCell: (params) => {
			return <Typography>{params.value}</Typography>;
		},
	},
	{
		field: "vendorEmail",
		headerName: "Vendor Email",
		flex: 1,
		renderCell: (params) => {
			return <Typography>{params.value}</Typography>;
		},
	},
	{
		field: "expenseNumber",
		headerName: "Expense Number",
		flex: 1,
		renderCell: (params) => {
			return <Typography>{params.value}</Typography>;
		},
	},
	{
		field: "expenseDate",
		headerName: "Expense Date",
		flex: 1,
		renderCell: (params) => {
			return <Typography>{params.value}</Typography>;
		},
	},
	{
		field: "expenseAmount",
		headerName: "Expense Amount",
		flex: 1,
		renderCell: (params) => {
			return <Typography>{params.value}</Typography>;
		},
	},
];
const VendorsReportTableList = () => {
	return (
		<Box>
			<DataGrid autoHeight rows={expenseData} columns={columns} />
		</Box>
	);
};

export default VendorsReportTableList;
