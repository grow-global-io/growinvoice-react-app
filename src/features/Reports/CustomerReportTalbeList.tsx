import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import { useReportsControllerGetCustomerReports } from "@api/services/reports";
import { convertUtcToFormat, currencyFormatter } from "@shared/formatter";
import Loader from "@shared/components/Loader";
import { useAuthStore } from "@store/auth";
import { useMemo } from "react";
import { useInvoiceHook } from "@features/Invoices/invoiceHooks/useInvoiceHook";
import { CustomToolbar } from "@shared/components/CustomToolbar";

const CustomerReportTalbeList = ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
	const { user } = useAuthStore();
	const { handleView } = useInvoiceHook();
	const customerReportData = useReportsControllerGetCustomerReports(
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
	console.log(customerReportData, "data");
	const CustomerReportMap = useMemo(() => {
		if (customerReportData?.data && customerReportData?.data?.length > 0) {
			return customerReportData?.data?.map((item) => {
				return {
					CustomerName: item?.customer?.name,
					InvoiceDate: item?.date,
					InvoiceNumber: item?.invoice_number,
					InvoiceAmount: item?.total,
				};
			});
		}
		return [];
	}, [customerReportData?.data]);
	const columns: GridColDef[] = [
		{
			field: "name",
			headerName: "Customer Name",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography
						sx={{
							color: "primary.main",
							cursor: "pointer",
							fontWeight: "bold",
						}}
					>
						{params?.row?.customer?.name}
					</Typography>
				);
			},
		},
		{
			field: "date",
			headerName: "Invoice Date",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{convertUtcToFormat(params?.value)}</Typography>;
			},
		},
		{
			field: "invoice_number",
			headerName: "Invoice Number",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Box
						sx={{ cursor: "pointer" }}
						onClick={() => {
							handleView(params.row?.id);
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
			field: "total",
			headerName: "Invoice Amount",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>{currencyFormatter(params?.value, user?.currency?.short_code)}</Typography>
				);
			},
		},
	];

	if (customerReportData?.isLoading || customerReportData?.isFetching) {
		return <Loader />;
	}
	return (
		<Box>
			<DataGrid
				autoHeight
				rows={customerReportData?.data ?? []}
				columns={columns}
				slots={{
					toolbar: () => {
						return <CustomToolbar rows={CustomerReportMap ?? []} />;
					},
				}}
			/>
		</Box>
	);
};

export default CustomerReportTalbeList;
