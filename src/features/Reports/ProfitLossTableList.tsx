import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Typography } from "@mui/material";
import { useReportsControllerGetProfitLossReports } from "@api/services/reports";
import Loader from "@shared/components/Loader";
import { useMemo } from "react";
import { currencyFormatter } from "@shared/formatter";
import { useAuthStore } from "@store/auth";
import { useInvoiceHook } from "@features/Invoices/invoiceHooks/useInvoiceHook";
import { CustomToolbar } from "@shared/components/CustomToolbar";
import { useTranslation } from "react-i18next";

const ProfitLossTableList = ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const { handleView } = useInvoiceHook();
	const profitLossReportData = useReportsControllerGetProfitLossReports(
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
	const invoiceMap = useMemo(() => {
		if (profitLossReportData?.data?.invoices && profitLossReportData?.data?.invoices?.length > 0) {
			return profitLossReportData?.data?.invoices?.map((item) => {
				return {
					type: "INVOICE",
					id: item?.id,
					number: item?.invoice_number,
					category: "-",
					date: item?.date,
					amount: item?.total,
					referenceNumber: item?.reference_number,
				};
			});
		}
		return [];
	}, [profitLossReportData?.data?.invoices]);

	const expenseMap = useMemo(() => {
		if (profitLossReportData?.data?.expenses && profitLossReportData?.data?.expenses?.length > 0) {
			return profitLossReportData?.data?.expenses?.map((item) => {
				return {
					type: "EXPENSES",
					id: item?.id,
					number: "-",
					category: item?.category,
					date: item?.expenseDate,
					amount: item?.amount,
					referenceNumber: "-",
				};
			});
		}
		return [];
	}, [profitLossReportData?.data?.expenses]);

	const combined = [...invoiceMap, ...expenseMap];

	const columns: GridColDef[] = [
		{
			field: "type",
			headerName: t("report.pl.type", { defaultValue: "Type" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Button
						variant="contained"
						sx={{
							bgcolor: params.value == "INVOICE" ? "custom.GreenBtnColor" : "custom.apiBtnBgColor",
							fontWeight: 300,
						}}
					>
						{params.value}
					</Button>
				);
			},
		},
		{
			field: "id",
			headerName: t("report.pl.expenseId", { defaultValue: "Expense ID" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "number",
			headerName: t("report.pl.invoiceNumber", { defaultValue: "Invoice Number" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Box
						sx={{ cursor: "pointer" }}
						onClick={() => {
							params?.value === "-" ? undefined : handleView(params.row?.id);
						}}
					>
						<Typography variant="h6" color={"secondary"}>
							{params?.value}
						</Typography>
					</Box>
				);
			},
		},
		{
			field: "category",
			headerName: t("report.pl.category", { defaultValue: "Category" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "amount",
			headerName: t("report.pl.amount", { defaultValue: "Amount" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const color =
					params.row.type === "INVOICE" ? "custom.GreenBtnColor" : "custom.apiBtnBgColor";
				return (
					<Typography color={color}>
						{" "}
						{params.row.type === "INVOICE" ? "+" : "-"}{" "}
						{currencyFormatter(params?.value, user?.currency?.short_code)}
					</Typography>
				);
			},
		},

		{
			field: "referenceNumber",
			headerName: t("report.pl.referenceNumber", { defaultValue: "Reference Number" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
	];

	if (profitLossReportData?.isLoading || profitLossReportData?.isFetching) {
		return <Loader />;
	}
	return (
		<Box>
			<DataGrid
				autoHeight
				rows={combined}
				columns={columns}
				slots={{
					toolbar: () => {
						return <CustomToolbar rows={combined ?? []} />;
					},
				}}
			/>
		</Box>
	);
};

export default ProfitLossTableList;
