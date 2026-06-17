import { Box, Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useExcelReader } from "@shared/hooks/useExcelReader";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { useCustomerControllerCreate, useCustomerControllerFindAll } from "@api/services/customer";
import { useProductControllerCreate, useProductControllerFindAll } from "@api/services/product";
import { useProductunitControllerFindAll } from "@api/services/productunit";
import { useAuthStore } from "@store/auth";
import { AlertService } from "@shared/services/AlertService";
import { useInvoiceControllerCreate } from "@api/services/invoice";
import { LoaderService } from "@shared/services/LoaderService";
import {
	CreateCustomerWithAddressDtoOption,
	CreateInvoiceWithProductsRecurring,
	CreateProductWithTaxDtoType,
} from "@api/services/models";
import { formatDateToIso } from "@shared/formatter";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useInvoicesettingsControllerFindFirst } from "@api/services/invoicesettings";
import { useInvoicetemplateControllerFindAll } from "@api/services/invoicetemplate";
import { useTaxcodeControllerFindAll } from "@api/services/tax-code";
import { useQueryClient } from "@tanstack/react-query";
import { getCustomerControllerFindAllQueryKey } from "@api/services/customer";
import { getProductControllerFindAllQueryKey } from "@api/services/product";

export type UploadStatus = "pending" | "uploaded" | "error";

const BulkUploadInvoice = () => {
	const { user } = useAuthStore();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const currencyList = useCurrencyControllerFindAll();
	const customerList = useCustomerControllerFindAll();
	const productList = useProductControllerFindAll();
	const productUnits = useProductunitControllerFindAll();

	const invoiceCreate = useInvoiceControllerCreate();
	const customerCreate = useCustomerControllerCreate();
	const productCreate = useProductControllerCreate();
	const invoiceSettings = useInvoicesettingsControllerFindFirst();
	const invoiceTemplateFindAll = useInvoicetemplateControllerFindAll();
	const taxCodes = useTaxcodeControllerFindAll();

	const schema = Yup.object().shape({
		invoice_number: Yup.string().required(t("invoiceForm.validation.invoiceNumberRequired")),
		date: Yup.string().required(t("invoiceForm.validation.invoiceDateRequired")),
		due_date: Yup.string().required(t("invoiceForm.validation.dueDateRequired")),
		currency_code: Yup.string().required(t("invoiceForm.validation.currencyRequired")),
		customer_email: Yup.string().email().required(t("invoiceForm.validation.customerRequired")),
		product_name: Yup.string().required(t("invoiceForm.validation.productRequired")),
		quantity: Yup.number().required(t("invoiceForm.validation.quantityRequired")).min(1),
		price: Yup.number().required(t("invoiceForm.validation.priceRequired")).min(0),
		tax_id: Yup.string().optional().nullable(),
		notes: Yup.string().optional().nullable(),
	});

	const columns: GridColDef[] = [
		{ field: "invoice_number", headerName: "Invoice #", flex: 1 },
		{ field: "customer_email", headerName: "Customer Email", flex: 1.5 },
		{ field: "product_name", headerName: "Product", flex: 1.5 },
		{ field: "quantity", headerName: "Qty", flex: 0.5 },
		{ field: "price", headerName: "Price", flex: 0.8 },
		{ field: "currency_code", headerName: "Currency", flex: 0.8 },
		{
			field: "status",
			headerName: "Status",
			flex: 1,
			renderCell(params) {
				const status = params.value as UploadStatus;
				return (
					<Typography variant="body2" color={status === "error" ? "error" : "textPrimary"}>
						{status.charAt(0).toUpperCase() + status.slice(1)}
						{params.row.reason && ` - ${params.row.reason}`}
					</Typography>
				);
			},
		},
	];

	const { rows, handleFileChange, errors, reset, setRows } = useExcelReader({
		validationSchema: schema,
	});

	const norm = (s: string) => (s ?? "").trim().toLowerCase();

	const handleUpload = async () => {
		LoaderService.instance.showLoader();

		const updatedRows = [...rows];

		for (let i = 0; i < updatedRows.length; i++) {
			const row = updatedRows[i];
			if (row.status === "uploaded") continue;

			try {
				// 1. Get Currency
				const currency = currencyList.data?.find(
					(c) =>
						norm(c.short_code ?? "") === norm(row.currency_code) ||
						norm(c.code ?? "") === norm(row.currency_code),
				);
				if (!currency) throw new Error(`Currency ${row.currency_code} not found in system.`);

				// 2. Get or Create Customer
				let customer = customerList.data?.find(
					(c) => norm(c.email ?? "") === norm(row.customer_email),
				);

				if (!customer) {
					const custRes = await customerCreate.mutateAsync({
						data: {
							user_id: user?.id ?? "",
							name: row.customer_email.split("@")[0], // Fallback name
							display_name: row.customer_email.split("@")[0],
							email: row.customer_email,
							option: CreateCustomerWithAddressDtoOption.Individual,
							currencies_id: currency.id,
						},
					});
					customer = custRes?.result as any;
					await queryClient.invalidateQueries({ queryKey: getCustomerControllerFindAllQueryKey() });
				}

				if (!customer || !customer.id)
					throw new Error(`Failed to identify customer ${row.customer_email}`);

				// 3. Get or Create Product
				let product = productList.data?.find((p) => norm(p.name ?? "") === norm(row.product_name));

				if (!product) {
					const unitId = productUnits.data?.[0]?.id ?? ""; // Fallback to first unit
					const prodRes = await productCreate.mutateAsync({
						data: {
							user_id: user?.id ?? "",
							name: row.product_name,
							type: CreateProductWithTaxDtoType.Goods,
							unit_id: unitId,
							priceBook: [{ currency_id: currency.id, price: row.price }],
						},
					});
					product = (prodRes as any)?.data || (prodRes as any)?.result || prodRes;
					await queryClient.invalidateQueries({ queryKey: getProductControllerFindAllQueryKey() });
				}

				if (!product || !product.id)
					throw new Error(`Failed to identify product ${row.product_name}`);

				// Ensure dates are parsed properly, fallback to today if invalid
				const parsedDate = moment(row.date, ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"]);
				const finalDate = parsedDate.isValid()
					? parsedDate.format("YYYY-MM-DD")
					: moment().format("YYYY-MM-DD");

				const parsedDueDate = moment(row.due_date, ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"]);
				const finalDueDate = parsedDueDate.isValid()
					? parsedDueDate.format("YYYY-MM-DD")
					: moment(finalDate).add(1, "day").format("YYYY-MM-DD");

				// 4. Get Tax Mapping
				let finalTaxId = undefined;
				if (row.tax_id && row.tax_id.trim() !== "") {
					const mappedTax = taxCodes.data?.find(
						(t) => t.id === row.tax_id?.trim() || norm(t.name || "") === norm(row.tax_id || ""),
					);
					if (mappedTax) {
						finalTaxId = mappedTax.id;
					} else {
						throw new Error(`Failed to identify tax code ${row.tax_id}`);
					}
				}

				// 5. Create Invoice
				const defaultTemplateId =
					invoiceSettings?.data?.invoiceTemplateId || invoiceTemplateFindAll?.data?.[0]?.id || "";
				if (!defaultTemplateId) throw new Error("No invoice template found in the system.");

				const invoiceData = {
					invoice_number: row.invoice_number,
					reference_number: row.invoice_number,
					date: formatDateToIso(finalDate),
					due_date: formatDateToIso(finalDueDate),
					currency_id: currency.id,
					customer_ids: [customer.id],
					user_id: user?.id ?? "",
					is_recurring: false,
					recurring: CreateInvoiceWithProductsRecurring.Daily,
					notes: row.notes || "",
					template_id: defaultTemplateId,
					sub_total: row.quantity * row.price,
					total: row.quantity * row.price,
					paid_amount: 0,
					due_amount: row.quantity * row.price,
					product: [
						{
							product_id: product.id,
							product_name: row.product_name,
							quantity: row.quantity,
							price: row.price,
							total: row.quantity * row.price,
							taxes: finalTaxId ? [finalTaxId] : undefined,
							discount: 0,
						},
					],
				};

				await invoiceCreate.mutateAsync({ data: invoiceData as any });
				updatedRows[i] = { ...row, status: "uploaded", reason: "" };
			} catch (err: any) {
				console.error("Upload error for row", i, err);
				updatedRows[i] = {
					...row,
					status: "error",
					reason: err.response?.data?.message || err.message,
				};
			}
			setRows([...updatedRows]);
		}

		LoaderService.instance.hideLoader();
		if (updatedRows.every((r) => r.status === "uploaded")) {
			AlertService.instance.successMessage("All invoices uploaded successfully");
			setTimeout(() => {
				queryClient.invalidateQueries();
				navigate("/invoice/invoicelist");
			}, 2000);
		} else {
			AlertService.instance.errorMessage(
				"Some invoices failed to upload. Please check the status.",
			);
		}
	};

	return (
		<Box p={3}>
			<Grid container spacing={2} alignItems="center" mb={3}>
				<Grid item xs={12} md={6}>
					<Typography variant="h4">
						{t("invoice.bulkUploadTitle", { defaultValue: "Bulk Upload Invoices" })}
					</Typography>
				</Grid>
				<Grid item xs={12} md={6} textAlign="right">
					<Button
						variant="outlined"
						sx={{ mr: 1 }}
						onClick={() => {
							const link = document.createElement("a");
							link.href = "/InvoiceTemplate.csv";
							link.download = "InvoiceTemplate.csv";
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
						}}
					>
						{t("customerForm.downloadTemplate", { defaultValue: "Download Template" })}
					</Button>
					{rows.length === 0 ? (
						<Button variant="contained" component="label">
							{t("invoiceForm.bulkUpload", { defaultValue: "Bulk Upload" })}
							<input type="file" hidden onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
						</Button>
					) : (
						<>
							<Button variant="contained" color="primary" onClick={handleUpload} sx={{ mr: 1 }}>
								{t("app.upload", { defaultValue: "Upload Invoices" })}
							</Button>
							<Button variant="outlined" color="error" onClick={reset}>
								{t("app.reset", { defaultValue: "Reset" })}
							</Button>
						</>
					)}
				</Grid>
			</Grid>

			{rows.length > 0 && (
				<Box sx={{ height: 500, width: "100%" }}>
					<DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 25, 50]} />
				</Box>
			)}

			{errors.length > 0 && (
				<Box mt={2}>
					<Typography color="error" variant="h6">
						Errors in file:
					</Typography>
					{errors.map((e, idx) => (
						<Typography key={idx} color="error" variant="body2">
							Row {e.id}: {e.error.message}
						</Typography>
					))}
				</Box>
			)}
		</Box>
	);
};

export default BulkUploadInvoice;
