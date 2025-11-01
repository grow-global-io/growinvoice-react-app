import { usePaymentsControllerFindAll } from "@api/services/payments";
import { useInvoiceHook } from "@features/Invoices/invoiceHooks/useInvoiceHook";
import { Box, Chip, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Loader from "@shared/components/Loader";
import NoDataFound from "@shared/components/NoDataFound";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import { useAuthStore } from "@store/auth";
import { useTranslation } from "react-i18next";

const PaymentsTableList = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const paymentsList = usePaymentsControllerFindAll();
	const { handleView } = useInvoiceHook();
	const columns: GridColDef[] = [
		{
			field: "paymentDate",
			headerName: t("payment.date", { defaultValue: "Payment Date" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography variant="body1" color="secondary">
						{parseDateStringToFormat(params.value)}
					</Typography>
				);
			},
		},
		{
			field: "amount",
			headerName: t("payment.amount", { defaultValue: "Payment Amount" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Chip
						label={`${currencyFormatter(params.value, user?.currency?.short_code ?? "USD")}`}
						style={{
							color: "custom.productTblColor",
							backgroundColor: "custom.productTbleBgColor",
							fontWeight: "bold",
						}}
					/>
				);
			},
		},
		{
			field: "paymentMethod",
			headerName: t("payment.method", { defaultValue: "Payment Method" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography textTransform={"capitalize"}>
						{params.row?.paymentDetails?.paymentType}
					</Typography>
				);
			},
		},
		{
			field: "invoiceNumber",
			headerName: t("invoice.table.invoiceNumber", { defaultValue: "Invoice Number" }),
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
	];

	if (paymentsList.isLoading || paymentsList.isFetching || paymentsList?.isRefetching) {
		return <Loader />;
	}

	if (paymentsList?.data === undefined) {
		return (
			<NoDataFound message={t("payment.noPaymentsFound", { defaultValue: "No Payments Found" })} />
		);
	}

	return (
		<Box>
			<DataGrid autoHeight rows={paymentsList?.data ?? []} columns={columns} />
		</Box>
	);
};

export default PaymentsTableList;
