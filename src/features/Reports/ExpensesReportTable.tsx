import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import { useReportsControllerGetExpenseReports } from "@api/services/reports";
import Loader from "@shared/components/Loader";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import { useMemo } from "react";
import { CustomToolbar } from "@shared/components/CustomToolbar";

const ExpensesReportTable = ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
	const expensesDate = useReportsControllerGetExpenseReports(
		{
			end: toDate,
			start: fromDate,
		},
		{
			query: {
				enabled: !!fromDate && !!toDate,
			},
		},
	);

	const ExpenseMap = useMemo(() => {
		if (expensesDate?.data && expensesDate?.data?.length > 0) {
			return expensesDate?.data?.map((item) => {
				return {
					ExpenseCategory: item?.category,
					ExpenseDate: item?.expenseDate,
					ExpenseAmount: item?.amount,
				};
			});
		}
		return [];
	}, [expensesDate?.data]);

	const rows = (expensesDate?.data?.length ?? 0) > 0 ? (expensesDate?.data ?? []) : [];
	const columns: GridColDef[] = [
		{
			field: "category",
			headerName: "Expense Category",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "expenseDate",
			headerName: "Expense Date",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params.value)}</Typography>;
			},
		},
		{
			field: "amount",
			headerName: "Expense Amount",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>
						{currencyFormatter(params.value, params?.row?.currency?.short_code)}
					</Typography>
				);
			},
		},
	];

	if (expensesDate.isLoading || expensesDate.isRefetching) {
		return <Loader />;
	}

	return (
		<Box>
			<DataGrid
				autoHeight
				rows={rows}
				columns={columns}
				slots={{
					toolbar: () => {
						return <CustomToolbar rows={ExpenseMap ?? []} />;
					},
				}}
			/>
		</Box>
	);
};

export default ExpensesReportTable;
