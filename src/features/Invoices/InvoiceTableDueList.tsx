import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
	DataGrid,
	type GridColDef,
	type GridRowSelectionModel,
	GridToolbarQuickFilter,
	GridFooterContainer,
	GridSelectedRowCount,
	useGridApiContext,
	useGridRootProps,
	useGridSelector,
} from "@mui/x-data-grid";
import { gridTopLevelRowCountSelector } from "@mui/x-data-grid/hooks/features/rows/gridRowsSelector";
import { selectedGridRowsCountSelector } from "@mui/x-data-grid/hooks/features/rowSelection/gridRowSelectionSelector";
import { gridFilteredTopLevelRowCountSelector } from "@mui/x-data-grid/hooks/features/filter/gridFilterSelector";
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
	invoiceControllerFindOne,
	useInvoiceControllerCreate,
} from "@api/services/invoice";
import Loader from "@shared/components/Loader";
import { type InvoiceWithAllDataDto } from "@api/services/models";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useInvoiceHook } from "./invoiceHooks/useInvoiceHook";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { AlertService } from "@shared/services/AlertService";
import { LoaderService } from "@shared/services/LoaderService";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { buildClonePayload } from "./utils/cloneInvoice";

const InvoiceTableFooterContext = createContext<{
	onCloneSelected?: (invoiceIds: string[]) => Promise<void>;
	selectedIds: GridRowSelectionModel;
}>({ selectedIds: [] });

function QuickSearchToolbar({
	selectedIds,
	onMarkAsPaid,
}: {
	selectedIds: GridRowSelectionModel;
	onMarkAsPaid: (invoiceIds: string[]) => Promise<void>;
}) {
	const { t, i18n } = useTranslation();

	const sendMail = useInvoiceControllerBulkInvoiceSentToMail();

	const handleSendMail = async () => {
		if (selectedIds.length === 0) return;
		await sendMail.mutateAsync({
			params: {
				ids: selectedIds as string[],
				lang: i18n.language,
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

function InvoiceTableFooterWithClone(props: React.ComponentProps<typeof GridFooterContainer>) {
	const { onCloneSelected, selectedIds = [] } = useContext(InvoiceTableFooterContext);
	const apiRef = useGridApiContext();
	const rootProps = useGridRootProps();
	const totalTopLevelRowCount = useGridSelector(apiRef, gridTopLevelRowCountSelector);
	const selectedRowCount = useGridSelector(apiRef, selectedGridRowsCountSelector);
	const visibleTopLevelRowCount = useGridSelector(apiRef, gridFilteredTopLevelRowCountSelector);
	const { t } = useTranslation();

	const selectedRowCountElement =
		!rootProps.hideFooterSelectedRowCount && selectedRowCount > 0 ? (
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<GridSelectedRowCount selectedRowCount={selectedRowCount} />
				{onCloneSelected && selectedIds.length > 0 && (
					<Button
						size="small"
						variant="outlined"
						startIcon={<ContentCopyIcon />}
						onClick={() => onCloneSelected(selectedIds as string[])}
					>
						{t("invoice.actions.cloneSelected", { defaultValue: "Clone selected" })}
					</Button>
				)}
			</Box>
		) : (
			<div />
		);
	const FooterRowCount = rootProps.slots.footerRowCount;
	const rowCountElement =
		!rootProps.hideFooterRowCount && !rootProps.pagination ? (
			<FooterRowCount
				{...rootProps.slotProps?.footerRowCount}
				rowCount={totalTopLevelRowCount}
				visibleRowCount={visibleTopLevelRowCount}
			/>
		) : null;
	const PaginationComponent = rootProps.slots.pagination;
	const paginationElement =
		rootProps.pagination &&
		!rootProps.hideFooterPagination &&
		PaginationComponent ? (
			<PaginationComponent {...rootProps.slotProps?.pagination} />
		) : null;

	return (
		<GridFooterContainer {...props}>
			{selectedRowCountElement}
			{rowCountElement}
			{paginationElement}
		</GridFooterContainer>
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
	const createInvoice = useInvoiceControllerCreate();

	const handleCloneSelected = async (invoiceIds: string[]) => {
		if (invoiceIds.length === 0) return;
		try {
			LoaderService.instance.showLoader();
			const newInvoiceNumbers: string[] = [];
			for (const id of invoiceIds) {
				const invoice = await invoiceControllerFindOne(id);
				const payload = buildClonePayload(invoice);
				const result = await createInvoice.mutateAsync({ data: payload });
				const created = result?.result?.[0];
				if (created?.invoice_number) newInvoiceNumbers.push(created.invoice_number);
			}
			await queryClient.refetchQueries({ queryKey: getInvoiceControllerFindAllQueryKey() });
			await queryClient.refetchQueries({
				queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
			});
			setRowSelectionModel([]);
			AlertService.instance.successMessage(
				t("invoice.actions.cloneSuccess", {
					defaultValue: "Invoice(s) cloned successfully. New invoice number(s): {{newInvoiceNumbers}}",
					newInvoiceNumbers: newInvoiceNumbers.join(", "),
				}),
			);
		} catch (error) {
			console.error("Error cloning invoices:", error);
			AlertService.instance.errorMessage(
				t("invoice.actions.cloneError", {
					defaultValue: "Failed to clone invoice(s). Please try again.",
				}),
			);
		} finally {
			LoaderService.instance.hideLoader();
		}
	};

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
				// Determine status based on paid_status, but keep Draft as Draft
				const paidStatus = params.row.paid_status;
				const originalStatus = params.value;
				let displayStatus: string;

				// If status is "Draft", keep it as "Draft" - don't change based on paid_status
				if (originalStatus === "Draft") {
					const statusKey = originalStatus?.toLowerCase().replace(/\s+/g, "") || "";
					displayStatus = t(`invoice.status.${statusKey}`, {
						defaultValue: originalStatus || "",
					});
				} else if (paidStatus === "Paid") {
					// If paid, show "Receipt Sent"
					displayStatus = t("invoice.status.receiptsent", { defaultValue: "Receipt Sent" });
				} else if (paidStatus === "Unpaid" || paidStatus === "PartiallyPaid") {
					// If unpaid or partially paid, show "Invoice Sent"
					displayStatus = t("invoice.status.invoicesent", { defaultValue: "Invoice Sent" });
				} else {
					// Fallback to original status if paid_status doesn't match expected values
					const statusKey = originalStatus?.toLowerCase().replace(/\s+/g, "") || "";
					displayStatus = t(`invoice.status.${statusKey}`, {
						defaultValue: originalStatus || "",
					});
				}

				return (
					<Chip
						label={displayStatus}
						color={
							originalStatus === "Draft"
								? (Constants?.invoiceStatusColorEnums[originalStatus] ?? "default")
								: paidStatus === "Paid"
									? (Constants?.invoiceStatusColorEnums["Receipt Sent"] ?? "default")
									: (Constants?.invoiceStatusColorEnums["Invoice Sent"] ??
										Constants?.invoiceStatusColorEnums[originalStatus] ??
										"default")
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
			<InvoiceTableFooterContext.Provider
				value={{ onCloneSelected: handleCloneSelected, selectedIds: rowSelectionModel }}
			>
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
						footer: InvoiceTableFooterWithClone,
					}}
				/>
			</InvoiceTableFooterContext.Provider>
		</Box>
	);
};

export default InvoiceTableDueList;
