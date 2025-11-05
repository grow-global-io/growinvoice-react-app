import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Chip, Typography } from "@mui/material";
import { Constants } from "@shared/constants";
import { useInvoiceControllerFindPaidInvoices } from "@api/services/invoice";
import Loader from "@shared/components/Loader";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import { useInvoiceHook } from "./invoiceHooks/useInvoiceHook";
import { type InvoiceWithAllDataDto } from "@api/services/models";
import { useTranslation } from "react-i18next";

const InvoiceTablePaidList = ({ customerId }: { customerId?: string | null }) => {
	const { t } = useTranslation();
	const invoiceData = useInvoiceControllerFindPaidInvoices({
		customerId: customerId ?? undefined,
	});
	const { handleView } = useInvoiceHook();

	const columns: GridColDef<InvoiceWithAllDataDto>[] = [
		{
			field: "invoice_number",
			headerName: t("invoice.table.invoiceNumber", { defaultValue: "Invoice Number" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Box
						sx={{ cursor: "pointer" }}
						onClick={() => {
							handleView(params.row.id);
						}}
					>
						<Typography variant="h6" color={"secondary"}>
							{params.value}
						</Typography>
					</Box>
				);
			},
		},
		{
			field: "source",
			headerName: t("invoice.table.source", { defaultValue: "Source" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const sourceLabel = params.row.fromStore
					? t("invoice.source.store", { defaultValue: "Store" })
					: t("invoice.source.direct", { defaultValue: "Direct" });
				return <Chip label={sourceLabel} variant="filled" color="primary" />;
			},
		},
		{
			field: "due_date",
			headerName: t("invoice.table.dueDate", { defaultValue: "Due Date" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params?.value)}</Typography>;
			},
		},
		{
			field: "status",
			headerName: t("invoice.table.status", { defaultValue: "Status" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const statusKey = params.value?.toLowerCase().replace(/\s+/g, "") || "";
				let translatedStatus = t(`invoice.status.${statusKey}`, {
					defaultValue: params.value || "",
				});
				// Explicitly map "Mailed to customer" to "Receipt Sent"
				if (params.value === "Mailed to customer") {
					translatedStatus = t("invoice.status.mailedtocustomer", { defaultValue: "Receipt Sent" });
				}
				return (
					<Chip
						label={translatedStatus}
						color={
							Constants?.invoiceStatusColorEnums[params?.value] ??
							Constants?.invoiceStatusColorEnums["Receipt Sent"] ??
							"default"
						}
						variant="filled"
					/>
				);
			},
		},
		{
			field: "paid_status",
			headerName: t("invoice.table.paidStatus", { defaultValue: "Paid Status" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const paymentStatusKey = params.value?.toLowerCase().replace(/\s+/g, "") || "";
				const translatedPaymentStatus = t(`invoice.paymentStatus.${paymentStatusKey}`, {
					defaultValue: params.value || "",
				});
				return (
					<Chip
						label={translatedPaymentStatus}
						color={Constants?.invoiceStatusColorEnums[params?.value] ?? "default"}
						variant="filled"
					/>
				);
			},
		},
		{
			field: "paid_amount",
			headerName: t("invoice.table.totalPaidAmount", { defaultValue: "Total Paid Amount" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>
						{currencyFormatter(params.value, params.row.currency?.short_code)}
					</Typography>
				);
			},
		},
		{
			field: "total",
			headerName: t("invoice.table.total", { defaultValue: "Total" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>
						{currencyFormatter(params?.value, params.row.currency?.short_code)}
					</Typography>
				);
			},
		},

		{
			field: "action",
			headerName: t("invoice.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => (
				<CustomIconButton
					src={VisibilityIcon}
					onClick={() => {
						handleView(params?.row?.id);
					}}
				/>
			),
		},
	];

	if (invoiceData.isLoading) return <Loader />;

	return (
		<Box>
			<DataGrid autoHeight rows={invoiceData?.data ?? []} columns={columns} />
		</Box>
	);
};

export default InvoiceTablePaidList;
