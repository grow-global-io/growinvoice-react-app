import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Chip, Tooltip, Typography } from "@mui/material";
import { Constants } from "@shared/constants";
import {
	useInvoiceControllerFindPaidInvoices,
	getInvoiceControllerTestPDFGenQueryKey,
	useInvoiceControllerSendInvoicePaymentReceiptManually,
} from "@api/services/invoice";
import Loader from "@shared/components/Loader";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import { type InvoiceWithAllDataDto } from "@api/services/models";
import { useTranslation } from "react-i18next";
import { LoaderService } from "@shared/services/LoaderService";
import { environment } from "@enviroment";
import { http } from "@shared/axios";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";

const InvoiceTablePaidList = ({ customerId }: { customerId?: string | null }) => {
	const sendReceipt = useInvoiceControllerSendInvoicePaymentReceiptManually();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const invoiceData = useInvoiceControllerFindPaidInvoices({
		customerId: customerId ?? undefined,
	});
	// Custom handler for viewing receipts - navigates to receipt detail page
	const handleViewReceipt = (invoiceId: string) => {
		navigate(`/receipt/receiptdetails/${invoiceId}`);
	};

	// Custom handler for editing receipts - navigates to receipt creation page
	const handleEditReceipt = (invoiceId: string) => {
		navigate(`/receipt/createreceipt/${invoiceId}`);
	};

	const downloadPdf = async (invoiceId: string, invoiceNumber?: string) => {
		LoaderService.instance.showLoader();
		try {
			const fileName = `INV-${invoiceNumber ?? invoiceId}.pdf`;
			const pdfUrl = environment?.baseUrl + getInvoiceControllerTestPDFGenQueryKey(invoiceId)[0];
			const response = await http.get(pdfUrl, { responseType: "blob" });
			const blob = new Blob([response.data], { type: "application/pdf" });
			// await filesaver.saveAs(blob, fileName);
			const blobUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(blobUrl);
		} catch (e) {
			console.error("Failed to download invoice PDF", e);
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
							handleViewReceipt(params.row.id);
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
				// Determine status based on paid_status, but keep Draft as Draft
				const paidStatus = params.row.paid_status;
				const originalStatus = params.value;
				let displayStatus: string;

				// Debug log in development
				if (import.meta.env.DEV) {
					console.log("Status Debug:", {
						paidStatus,
						originalStatus,
						invoiceId: params.row.id,
					});
				}

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
							paidStatus === "Paid"
								? (Constants?.invoiceStatusColorEnums["Receipt Sent"] ?? "default")
								: (Constants?.invoiceStatusColorEnums["Invoice Sent"] ??
									Constants?.invoiceStatusColorEnums[params?.value] ??
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
				<>
					<Box display="flex" gap={1} justifyContent={"center"} alignItems="center">
						<Box>
							<Tooltip title={t("invoice.table.viewInvoice", { defaultValue: "View Invoice" })}>
								<span>
									<CustomIconButton
										src={VisibilityIcon}
										onClick={() => {
											handleViewReceipt(params?.row?.id);
										}}
									/>
								</span>
							</Tooltip>
						</Box>
						<Box>
							<Tooltip title={t("invoice.table.editInvoice", { defaultValue: "Edit Invoice" })}>
								<span>
									<CustomIconButton
										src={EditIcon}
										onClick={() => {
											handleEditReceipt(params?.row?.id);
										}}
									/>
								</span>
							</Tooltip>
						</Box>
						<Box>
							<Tooltip title={t("invoice.table.downloadPdf", { defaultValue: "Download PDF" })}>
								<span>
									<CustomIconButton
										src={DownloadIcon}
										onClick={() => {
											downloadPdf(params?.row?.id, params?.row?.invoice_number);
										}}
									/>
								</span>
							</Tooltip>
						</Box>
						<Box>
							<Tooltip title={t("invoice.table.sendReceipt", { defaultValue: "Send Receipt" })}>
								<span>
									<CustomIconButton
										disabled={sendReceipt.isPending}
										src={EmailIcon}
										onClick={async () => {
											await sendReceipt.mutateAsync({
												params: {
													id: params?.row?.id,
												},
											});
										}}
									/>
								</span>
							</Tooltip>
						</Box>
					</Box>
				</>
			),
		},
	];

	if (invoiceData.isLoading) return <Loader />;

	// Sort invoices by createdAt in descending order (newest first)
	const sortedInvoices = [...(invoiceData?.data ?? [])].sort((a, b) => {
		const dateA = new Date(a.createdAt).getTime();
		const dateB = new Date(b.createdAt).getTime();
		return dateB - dateA; // Descending order (newest first)
	});

	return (
		<Box>
			<DataGrid autoHeight rows={sortedInvoices} columns={columns} />
		</Box>
	);
};

export default InvoiceTablePaidList;
