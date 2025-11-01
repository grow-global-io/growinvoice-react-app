import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Chip, Tooltip, Typography } from "@mui/material";
import { Constants } from "@shared/constants";
import { useInvoiceControllerFindDueInvoices } from "@api/services/invoice";
import Loader from "@shared/components/Loader";
import { InvoiceWithAllDataDto } from "@api/services/models";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useInvoiceHook } from "./invoiceHooks/useInvoiceHook";
import { useTranslation } from "react-i18next";

const InvoiceTableDueList = ({ customerId }: { customerId?: string | null }) => {
	const { t } = useTranslation();
	const invoiceData = useInvoiceControllerFindDueInvoices({
		customerId: customerId ?? undefined,
	});
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const { handleDelete, handleEdit, handleView } = useInvoiceHook();
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
				return <Typography>{parseDateStringToFormat(params.value)}</Typography>;
			},
		},
		{
			field: "status",
			headerName: t("invoice.table.status", { defaultValue: "Status" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const statusKey = params.value?.toLowerCase().replace(/\s+/g, "") || "";
				const translatedStatus = t(`invoice.status.${statusKey}`, {
					defaultValue: params.value || "",
				});
				return (
					<Chip
						label={translatedStatus}
						color={Constants?.invoiceStatusColorEnums[params.value] ?? "default"}
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
						color={Constants?.invoiceStatusColorEnums[params.value] ?? "default"}
						variant="filled"
					/>
				);
			},
		},
		{
			field: "due_amount",

			headerName: t("invoice.table.totalDueAmount", { defaultValue: "Total Due Amount" }),
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
						{currencyFormatter(params.value, params.row.currency?.short_code)}
					</Typography>
				);
			},
		},

		{
			field: "action",
			headerName: t("invoice.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("invoice.table.viewInvoice", { defaultValue: "View Invoice" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleView(params.row.id);
							}}
							src={VisibilityIcon}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("invoice.table.editInvoice", { defaultValue: "Edit Invoice" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleEdit(params.row.id);
							}}
							src={EditIcon}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("invoice.table.deleteInvoice", { defaultValue: "Delete Invoice" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: t("invoice.actions.deleteTitle", { defaultValue: "Delete Invoice" }),
									message: t("invoice.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this invoice?",
									}),
									onConfirm: async () => {
										await handleDelete(params.row.id);
									},
									onCancel: () => {
										cleanUp();
									},
									confirmButtonText: t("common.delete", { defaultValue: "Delete" }),
								});
							}}
						/>
					</Box>
				</Tooltip>,
			],
		},
	];

	if (invoiceData.isLoading) return <Loader />;

	return (
		<Box>
			<DataGrid autoHeight rows={invoiceData?.data ?? []} columns={columns} />
		</Box>
	);
};

export default InvoiceTableDueList;
