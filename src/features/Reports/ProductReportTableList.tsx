import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Typography, Chip } from "@mui/material";
import { useReportsControllerGetProductReports } from "@api/services/reports";
import Loader from "@shared/components/Loader";
import { convertUtcToFormat, currencyFormatter } from "@shared/formatter";
import { useMemo } from "react";
import { useInvoiceHook } from "@features/Invoices/invoiceHooks/useInvoiceHook";
import { CustomToolbar } from "@shared/components/CustomToolbar";
import { useTranslation } from "react-i18next";
import { Constants } from "@shared/constants";

const ProductReportTableList = ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
	const { t } = useTranslation();
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
	// Filter to only show Paid and Partially Paid invoices
	const filteredProductReportData = useMemo(() => {
		if (!productReportData?.data || productReportData.data.length === 0) {
			return [];
		}
		return productReportData.data.filter((item: any) => {
			const paidStatus = item?.paid_status || item?.invoice?.paid_status;
			return paidStatus === "Paid" || paidStatus === "PartiallyPaid";
		});
	}, [productReportData?.data]);

	const ProductReportMap = useMemo(() => {
		if (filteredProductReportData && filteredProductReportData.length > 0) {
			return filteredProductReportData.map((item) => {
				return {
					ProductName: item?.product?.name,
					InvoiceDate: item?.invoice?.date,
					InvoiceNumber: item?.invoice?.invoice_number,
					InvoiceAmount: item?.invoice?.total,
				};
			});
		}
		return [];
	}, [filteredProductReportData]);
	const { handleView } = useInvoiceHook();
	const columns: GridColDef[] = [
		{
			field: "product",
			headerName: t("report.product.productName", { defaultValue: "Product Name" }),
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
			headerName: t("report.product.invoiceDate", { defaultValue: "Invoice Date" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{convertUtcToFormat(params.row?.invoice?.date)}</Typography>;
			},
		},
		{
			field: "invoiceNumber",
			headerName: t("report.product.invoiceNumber", { defaultValue: "Invoice Number" }),
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
			headerName: t("report.product.invoiceAmount", { defaultValue: "Invoice Amount" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{currencyFormatter(params.row?.invoice?.total)}</Typography>;
			},
		},
		{
			field: "paid_status",
			headerName: t("invoice.table.paidStatus", { defaultValue: "Status" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const paidStatus = params.row?.paid_status || params.row?.invoice?.paid_status;
				if (!paidStatus) return null;

				// Show status, with special emphasis on Partially Paid
				const paymentStatusKey = paidStatus?.toLowerCase().replace(/\s+/g, "") || "";
				const translatedPaymentStatus = t(`invoice.paymentStatus.${paymentStatusKey}`, {
					defaultValue: paidStatus === "PartiallyPaid" ? "Partially Paid" : paidStatus,
				});

				return (
					<Chip
						label={translatedPaymentStatus}
						color={Constants?.invoiceStatusColorEnums[paidStatus] ?? "default"}
						variant="filled"
					/>
				);
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
				rows={filteredProductReportData ?? []}
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
