import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Chip, Typography, Tooltip } from "@mui/material";
import Loader from "@shared/components/Loader";
import {
	useInvoiceControllerFindAll,
	useInvoiceControllerUpdate,
	getInvoiceControllerFindAllQueryKey,
} from "@api/services/invoice";
import {
	type InvoiceWithAllDataDto,
	type InvoiceProductWithAllDataDto,
} from "@api/services/models";
import { useCustomerControllerFindAll } from "@api/services/customer";
import { currencyFormatter } from "@shared/formatter";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditShippingDialog from "./EditShippingDialog";

const OrdersList = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	// Fetch all invoices; we'll filter client-side to only include store orders
	const invoiceData = useInvoiceControllerFindAll();
	const invoiceUpdate = useInvoiceControllerUpdate();
	const customersQuery = useCustomerControllerFindAll();

	// Local state to manage shipping status and reference numbers
	const [shippingStatuses, setShippingStatuses] = useState<Record<string, string>>({});
	const [shippingRefNumbers, setShippingRefNumbers] = useState<Record<string, string>>({});
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithAllDataDto | null>(null);

	// Extract shipping status from notes or use default
	const getShippingStatus = (invoice: InvoiceWithAllDataDto): string => {
		const invoiceId = invoice.id;
		if (shippingStatuses[invoiceId]) {
			return shippingStatuses[invoiceId];
		}
		// Try to extract from notes if it contains shipping status
		if (invoice.notes?.includes("SHIPPING_STATUS:")) {
			const match = invoice.notes.match(/SHIPPING_STATUS:(\w+)/);
			if (match) {
				return match[1];
			}
		}
		// Default to "ToBeShipped"
		return "ToBeShipped";
	};

	// Extract shipping reference number from notes
	const getShippingRefNumber = (invoice: InvoiceWithAllDataDto): string => {
		const invoiceId = invoice.id;
		if (shippingRefNumbers[invoiceId]) {
			return shippingRefNumbers[invoiceId];
		}
		// Try to extract from notes
		if (invoice.notes?.includes("SHIPPING_REF:")) {
			const match = invoice.notes.match(/SHIPPING_REF:([^\n]+)/);
			if (match) {
				return match[1].trim();
			}
		}
		return "";
	};

	const handleEditShipping = (invoice: InvoiceWithAllDataDto) => {
		setSelectedInvoice(invoice);
		setEditDialogOpen(true);
	};

	const handleSaveShipping = async (
		invoiceId: string,
		shippingStatus: string,
		shippingRefNumber: string,
	) => {
		const invoice = invoiceData?.data?.find((inv) => inv.id === invoiceId) as
			| InvoiceWithAllDataDto
			| undefined;
		if (!invoice) return;

		try {
			// Update local state
			setShippingStatuses((prev) => ({
				...prev,
				[invoiceId]: shippingStatus,
			}));
			setShippingRefNumbers((prev) => ({
				...prev,
				[invoiceId]: shippingRefNumber,
			}));

			// Preserve existing notes and update shipping info
			let existingNotes = invoice.notes || "";
			// Remove old shipping status and ref
			existingNotes = existingNotes
				.replace(/SHIPPING_STATUS:\w+\s*/g, "")
				.replace(/SHIPPING_REF:[^\n]+\s*/g, "")
				.trim();

			// Add new shipping status and ref
			const parts: string[] = [];
			if (existingNotes) parts.push(existingNotes);
			parts.push(`SHIPPING_STATUS:${shippingStatus}`);
			if (shippingRefNumber) {
				parts.push(`SHIPPING_REF:${shippingRefNumber}`);
			}
			const updatedNotes = parts.join("\n");

			await invoiceUpdate.mutateAsync({
				id: invoiceId,
				data: {
					currency_id: invoice.currency_id,
					customer_id: invoice.customer_id,
					date: invoice.date,
					discountPercentage: invoice.discountPercentage,
					due_amount: invoice.due_amount,
					due_date: invoice.due_date,
					fromStore: invoice.fromStore,
					invoice_number: invoice.invoice_number,
					is_recurring: invoice.is_recurring,
					notes: updatedNotes,
					paid_amount: invoice.paid_amount,
					paymentId: invoice.paymentId,
					product: (invoice.product || []).map((p: InvoiceProductWithAllDataDto) => ({
						product_id: p.product_id,
						quantity: p.quantity,
						price: p.price,
						total: p.total,
						hsnCode_id: p.hsnCode_id,
						taxes: p.tax_forInvoiceProducts?.map((t) => t.tax_id) || undefined,
					})),
					recurring: invoice.recurring,
					reference_number: invoice.reference_number,
					status: invoice.status,
					sub_total: invoice.sub_total,
					tax_id: invoice.tax_id,
					template_id: invoice.template_id,
					template_url: invoice.template_url,
					termsAccepted: invoice.termsAccepted,
					total: invoice.total,
					user_id: invoice.user_id,
				},
			});

			// Invalidate queries to refresh the data
			await queryClient.invalidateQueries({
				queryKey: getInvoiceControllerFindAllQueryKey(),
			});
		} catch (error) {
			console.error("Failed to update shipping details:", error);
			// Revert on error
			setShippingStatuses((prev) => {
				const updated = { ...prev };
				delete updated[invoiceId];
				return updated;
			});
			setShippingRefNumbers((prev) => {
				const updated = { ...prev };
				delete updated[invoiceId];
				return updated;
			});
		}
	};

	const columns: GridColDef<InvoiceWithAllDataDto>[] = [
		{
			field: "customer_name",
			headerName: t("orders.table.customerName", { defaultValue: "Customer Name" }),
			flex: 1,
			minWidth: 180,
			renderCell: (params) => <Typography>{(params as any)?.row?.customer?.name ?? ""}</Typography>,
		},
		{
			field: "customer_email",
			headerName: t("orders.table.customerEmail", { defaultValue: "Customer Email" }),
			flex: 1,
			minWidth: 200,
			renderCell: (params) => (
				<Typography>{(params as any)?.row?.customer?.email ?? ""}</Typography>
			),
		},
		{
			field: "customer_address",
			headerName: t("orders.table.customerAddress", { defaultValue: "Customer Address" }),
			flex: 1,
			minWidth: 220,
			renderCell: (params) => {
				const addressText =
					customerIdToAddress.get((params.row as InvoiceWithAllDataDto).customer_id) ||
					(params.row as InvoiceWithAllDataDto)?.customerBillingAddress ||
					(params.row as InvoiceWithAllDataDto)?.customerShippingAddress ||
					"";
				const isMissing = !addressText;
				return (
					<Typography sx={isMissing ? { color: "error.main" } : undefined}>
						{isMissing ? t("orders.toBeFilled", { defaultValue: "to be filled" }) : addressText}
					</Typography>
				);
			},
		},
		{
			field: "invoice_number",
			headerName: t("orders.table.invoiceNumber", { defaultValue: "Invoice Number" }),
			flex: 1,
			minWidth: 160,
		},
		{
			field: "paid_status",
			headerName: t("orders.table.invoiceStatus", { defaultValue: "Invoice Status" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => (
				<Chip
					label={t(`invoice.paymentStatus.${String(params.value).toLowerCase()}`, {
						defaultValue: String(params.value ?? ""),
					})}
					color={params.value === "Paid" ? "success" : "default"}
					variant="filled"
				/>
			),
		},
		{
			field: "status",
			headerName: t("orders.table.orderStatus", { defaultValue: "Order Status" }),
			flex: 1,
			minWidth: 160,
			renderCell: (params) => {
				const statusValue = String(params.value ?? "");
				const statusKey = statusValue.toLowerCase().replace(/\s+/g, "");
				let translatedStatus = t(`invoice.status.${statusKey}`, {
					defaultValue: statusValue,
				});
				// Explicitly map "Mailed to customer" to "Receipt Sent"
				if (statusValue === "Mailed to customer") {
					translatedStatus = t("invoice.status.mailedtocustomer", { defaultValue: "Receipt Sent" });
				}
				return <Typography>{translatedStatus}</Typography>;
			},
		},
		{
			field: "shipping_status",
			headerName: t("orders.table.shippingStatus", { defaultValue: "Shipment Status" }),
			flex: 1,
			minWidth: 180,
			renderCell: (params) => {
				const invoice = params.row as InvoiceWithAllDataDto;
				const status = getShippingStatus(invoice);
				const statusLabel =
					status === "Shipped"
						? t("orders.table.shippingStatus.shipped", { defaultValue: "Shipped" })
						: t("orders.table.shippingStatus.toBeShipped", { defaultValue: "To be shipped" });
				return (
					<Chip
						label={statusLabel}
						color={status === "Shipped" ? "success" : "warning"}
						variant="filled"
					/>
				);
			},
		},
		{
			field: "shipping_ref_number",
			headerName: t("orders.table.shippingRefNumber", {
				defaultValue: "Shipping Reference Number",
			}),
			flex: 1,
			minWidth: 220,
			renderCell: (params) => {
				const invoice = params.row as InvoiceWithAllDataDto;
				const refNumber = getShippingRefNumber(invoice);
				const isMissing = !refNumber;
				return (
					<Typography sx={isMissing ? { color: "error.main" } : undefined}>
						{isMissing ? t("orders.toBeFilled", { defaultValue: "to be filled" }) : refNumber}
					</Typography>
				);
			},
		},
		{
			field: "payment_status",
			headerName: t("orders.table.paymentStatus", { defaultValue: "Payment Status" }),
			flex: 1,
			minWidth: 160,
			renderCell: (params) => (
				<Typography>
					{t(
						`invoice.paymentStatus.${String((params as any)?.row?.paid_status ?? "").toLowerCase()}`,
						{ defaultValue: (params as any)?.row?.paid_status ?? "" },
					)}
				</Typography>
			),
		},
		/*
		{
			field: "payment_mode",
			headerName: t("orders.table.paymentMode", { defaultValue: "Payment Mode" }),
			flex: 1,
			minWidth: 160,
			renderCell: (params) => {
				const invoice = params.row as InvoiceWithAllDataDto;
				let key: string | undefined =
					paymentTypeByInvoice.byId.get(invoice.id) ||
					paymentTypeByInvoice.byNumber.get(invoice.invoice_number);
				const pd = invoice?.payment;
				if (!key) key = (pd?.paymentType as unknown as string | undefined) ?? undefined;
				if (!key) {
					if (pd?.stripeId) key = "stripe";
					else if (pd?.paypalId) key = "paypal";
					else if (pd?.razorpayId) key = "razorpay";
					else if (pd?.mollieId) key = "mollie";
					else if (pd?.upiId) key = "upi";
					else if (pd?.swiftCode || pd?.bicNumber || pd?.ibanNumber) key = "europeanbank";
					else if (pd?.account_no && pd?.ifscCode) key = "indianbanks";
				}
				if (!key) return <Typography>{t("common.null", { defaultValue: "null" })}</Typography>;
				return (
					<Typography>
						{t(`paymentDetails.types.${String(key).toLowerCase()}` as any, {
							defaultValue: String(key),
						})}
					</Typography>
				);
			},
		},
		*/
		{
			field: "total",
			headerName: t("orders.table.total", { defaultValue: "Total" }),
			flex: 1,
			minWidth: 140,
			renderCell: (params) => (
				<Typography>{currencyFormatter(params.value, params.row.currency?.short_code)}</Typography>
			),
		},
		{
			field: "action",
			headerName: t("common.actions", { defaultValue: "Actions" }),
			flex: 1,
			minWidth: 120,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("orders.table.editShipping", { defaultValue: "Edit Shipping Details" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleEditShipping(params.row as InvoiceWithAllDataDto);
							}}
							src={EditIcon}
						/>
					</Box>
				</Tooltip>,
			],
		},
	];

	const rows = useMemo(() => {
		return (invoiceData?.data ?? []).filter((inv) => inv.fromStore === true);
	}, [invoiceData?.data]);

	const customerIdToAddress = useMemo(() => {
		const map = new Map<string, string>();
		(customersQuery?.data ?? []).forEach((c: any) => {
			const addr = c?.billingAddress;
			if (addr) {
				const formatted = [addr.address, addr.city, addr.state?.name, addr.zip]
					.filter(Boolean)
					.join(", ");
				if (c.id) map.set(c.id, formatted);
			}
		});
		return map;
	}, [customersQuery?.data]);

	// Initialize shipping statuses and reference numbers from notes
	useEffect(() => {
		if (rows.length > 0) {
			const initialStatuses: Record<string, string> = {};
			const initialRefs: Record<string, string> = {};
			rows.forEach((inv) => {
				if (!shippingStatuses[inv.id]) {
					// Extract shipping status from notes or use default
					let status = "ToBeShipped";
					if (inv.notes?.includes("SHIPPING_STATUS:")) {
						const match = inv.notes.match(/SHIPPING_STATUS:(\w+)/);
						if (match) {
							status = match[1];
						}
					}
					initialStatuses[inv.id] = status;
				}
				if (!shippingRefNumbers[inv.id]) {
					// Extract shipping reference number from notes
					let refNumber = "";
					if (inv.notes?.includes("SHIPPING_REF:")) {
						const match = inv.notes.match(/SHIPPING_REF:([^\n]+)/);
						if (match) {
							refNumber = match[1].trim();
						}
					}
					if (refNumber) {
						initialRefs[inv.id] = refNumber;
					}
				}
			});
			if (Object.keys(initialStatuses).length > 0) {
				setShippingStatuses((prev) => ({
					...prev,
					...initialStatuses,
				}));
			}
			if (Object.keys(initialRefs).length > 0) {
				setShippingRefNumbers((prev) => ({
					...prev,
					...initialRefs,
				}));
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rows]);

	if (invoiceData.isLoading) return <Loader />;

	return (
		<Box>
			<DataGrid autoHeight rows={rows} columns={columns} />
			<EditShippingDialog
				open={editDialogOpen}
				onClose={() => {
					setEditDialogOpen(false);
					setSelectedInvoice(null);
				}}
				invoice={selectedInvoice}
				onSave={handleSaveShipping}
			/>
		</Box>
	);
};

export default OrdersList;
