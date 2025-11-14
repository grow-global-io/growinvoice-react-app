import Box from "@mui/material/Box";
import {
	DataGrid,
	type GridColDef,
	type GridRowSelectionModel,
	GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Chip, Tooltip, Typography } from "@mui/material";
import { Constants } from "@shared/constants";
import {
	useInvoiceControllerBulkInvoiceSentToMail,
	useInvoiceControllerFindDueInvoices,
	getInvoiceControllerFindAllQueryKey,
	getInvoiceControllerFindDueInvoicesQueryKey,
	getInvoiceControllerFindPaidInvoicesQueryKey,
	getInvoiceControllerInvoiceCountQueryKey,
	getInvoiceControllerTotalDueQueryKey,
	getInvoiceControllerOutstandingReceivableQueryKey,
} from "@api/services/invoice";
import Loader from "@shared/components/Loader";
import { type InvoiceWithAllDataDto } from "@api/services/models";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useInvoiceHook } from "./invoiceHooks/useInvoiceHook";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { AlertService } from "@shared/services/AlertService";
import { LoaderService } from "@shared/services/LoaderService";
import { useQueryClient } from "@tanstack/react-query";

function QuickSearchToolbar({
	selectedIds,
	onMarkAsPaid,
}: {
	selectedIds: GridRowSelectionModel;
	onMarkAsPaid: (invoiceIds: string[]) => Promise<void>;
}) {
	const { t } = useTranslation();

	const sendMail = useInvoiceControllerBulkInvoiceSentToMail();

	const handleSendMail = async () => {
		if (selectedIds.length === 0) return;
		await sendMail.mutateAsync({
			params: {
				ids: selectedIds as string[],
			},
		});
	};

	const handleMarkAsPaid = async () => {
		if (selectedIds.length === 0) return;
		await onMarkAsPaid(selectedIds as string[]);
	};

	return (
		<Box
			sx={{
				px: 1,
				pb: 0,
				float: "left",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<GridToolbarQuickFilter
				variant="outlined"
				quickFilterParser={(input) => input.split(/\s+/).filter(Boolean)}
				placeholder={t("common.search", { defaultValue: "Search" }) as string}
			/>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				{selectedIds && selectedIds.length > 0 && (
					<>
						<Tooltip
							title={t("invoice.actions.markAsPaid", {
								defaultValue: "Mark as Paid & Send Receipt",
							})}
						>
							<Box>
								<CustomIconButton
									src={CheckCircleIcon}
									onClick={handleMarkAsPaid}
									iconColor="primary"
								/>
							</Box>
						</Tooltip>
						<Tooltip title={t("invoice.actions.sendEmail", { defaultValue: "Send Email" })}>
							<Box>
								<CustomIconButton src={EmailIcon} onClick={handleSendMail} />
							</Box>
						</Tooltip>
					</>
				)}
			</Box>
		</Box>
	);
}

const InvoiceTableDueList = ({ customerId }: { customerId?: string | null }) => {
	const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
	const { t } = useTranslation();
	const invoiceData = useInvoiceControllerFindDueInvoices({
		customerId: customerId ?? undefined,
	});
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const { handleDelete, handleEdit, handleView, handlePaid } = useInvoiceHook();
	const queryClient = useQueryClient();

	const handleMarkAsPaid = async (invoiceIds: string[]) => {
		if (invoiceIds.length === 0) return;

		try {
			LoaderService.instance.showLoader();

			// Mark all selected invoices as paid and send receipts
			const promises = invoiceIds.map(async (invoiceId) => {
				try {
					// Mark as paid (this also sends receipt email)
					await handlePaid(invoiceId);
				} catch (error) {
					console.error(`Error processing invoice ${invoiceId}:`, error);
					// Continue with other invoices even if one fails
				}
			});

			await Promise.all(promises);

			// Refetch all relevant queries
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindAllQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerInvoiceCountQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerTotalDueQueryKey(),
			});
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerOutstandingReceivableQueryKey(),
			});

			// Clear selection
			setRowSelectionModel([]);

			AlertService.instance.successMessage(
				t("invoice.actions.markAsPaidSuccess", {
					defaultValue: `${invoiceIds.length} invoice(s) marked as paid and receipts sent successfully.`,
				}),
			);
		} catch (error) {
			console.error("Error marking invoices as paid:", error);
			AlertService.instance.errorMessage(
				t("invoice.actions.markAsPaidError", {
					defaultValue: "Failed to mark invoices as paid. Please try again.",
				}),
			);
		} finally {
			LoaderService.instance.hideLoader();
		}
	};
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
							Constants?.invoiceStatusColorEnums[params.value] ??
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
			<DataGrid
				autoHeight
				rows={invoiceData?.data ?? []}
				columns={columns}
				checkboxSelection
				onRowSelectionModelChange={(newRowSelectionModel) => {
					setRowSelectionModel(newRowSelectionModel);
				}}
				rowSelectionModel={rowSelectionModel}
				slots={{
					toolbar: () => (
						<QuickSearchToolbar selectedIds={rowSelectionModel} onMarkAsPaid={handleMarkAsPaid} />
					),
				}}
			/>
		</Box>
	);
};

export default InvoiceTableDueList;
