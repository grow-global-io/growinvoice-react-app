import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import { useReportsControllerGetProductReports } from "@api/services/reports";
import Loader from "@shared/components/Loader";
import { convertUtcToFormat, currencyFormatter } from "@shared/formatter";
import { useMemo } from "react";
import { useInvoiceHook } from "@features/Invoices/invoiceHooks/useInvoiceHook";
import { CustomToolbar } from "@shared/components/CustomToolbar";

const ProductReportTableList = ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
	const productReportData = useReportsControllerGetProductReports(
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
	const ProductReportMap = useMemo(() => {
		if (productReportData?.data && productReportData?.data?.length > 0) {
			return productReportData?.data?.map((item) => {
				return {
					ProductName: item?.product?.name,
					InvoiceDate: item?.invoice?.date,
					InvoiceNumber: item?.invoice?.invoice_number,
					InvoiceAmount: item?.invoice?.total,
				};
			});
		}
		return [];
	}, [productReportData?.data]);
	const { handleView } = useInvoiceHook();
	const columns: GridColDef[] = [
		{
			field: "product",
			headerName: "Product Name",
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
						{params.value?.name}
					</Typography>
				);
			},
		},
		{
			field: "invoiceDate",
			headerName: "Invoice Date",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{convertUtcToFormat(params.row?.invoice?.date)}</Typography>;
			},
		},
		{
			field: "invoiceNumber",
			headerName: "Invoice Number",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Box
						sx={{ cursor: "pointer" }}
						onClick={() => {
							handleView(params.row?.invoice?.id);
						}}
					>
						<Typography variant="h6" color={"secondary"}>
							{params.row?.invoice?.invoice_number}
						</Typography>
					</Box>
				);
			},
		},
		{
			field: "invoiceAmount",
			headerName: "Invoice Amount",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{currencyFormatter(params.row?.invoice?.total)}</Typography>;
			},
		},
	];
	if (productReportData.isLoading || productReportData.isRefetching) {
		return <Loader />;
	}
	return (
		<Box>
			<DataGrid
				autoHeight
				rows={productReportData?.data ?? []}
				columns={columns}
				slots={{
					toolbar: () => {
						return <CustomToolbar rows={ProductReportMap ?? []} />;
					},
				}}
			/>
		</Box>
	);
};

export default ProductReportTableList;
