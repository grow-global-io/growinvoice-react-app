import {
	Box,
	Card,
	CardContent,
	Grid,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	Menu,
	MenuItem,
} from "@mui/material";
import { useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@store/auth";
import { parseDateStringToFormat } from "@shared/formatter";
import { currencyFormatter } from "@shared/formatter";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BookIcon from "@mui/icons-material/Book";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useReportsControllerGetProfitLossReports } from "@api/services/reports";
import { usePaymentsControllerFindAll } from "@api/services/payments";
import Loader from "@shared/components/Loader";
import { useReportsControllerGetProductReports } from "@api/services/reports";
import { useInventoryControllerFindAll } from "@api/services/inventory";
import { useProductControllerFindAll } from "@api/services/product";
import type { InventoryListResponse } from "@api/services/inventory";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { LoaderService } from "@shared/services/LoaderService";

const Ledger = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();

	// Set to today's date (both from and to are today)
	const today = useMemo(() => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}, []);

	const fromDate = today;
	const toDate = today;

	// Fetch data from APIs
	const profitLossData = useReportsControllerGetProfitLossReports(
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

	const paymentsData = usePaymentsControllerFindAll();

	// Fetch invoice products with details for profit/loss calculation
	const invoiceProductsQuery = useReportsControllerGetProductReports(
		{
			end: toDate,
			start: fromDate,
		},
		{
			query: {
				enabled: true,
			},
		},
	);

	// Fetch inventory for cost prices
	const inventoryQuery = useInventoryControllerFindAll();

	// Fetch products for priceBook (selling prices)
	const productsQuery = useProductControllerFindAll();

	// Combine all data into ledger entries
	const ledgerEntries = useMemo(() => {
		const entries: Array<{
			id: string;
			date: string;
			description: string;
			type: "received" | "paid";
			amount: number;
		}> = [];

		// Add invoices (received)
		if (profitLossData?.data?.invoices && profitLossData.data.invoices.length > 0) {
			profitLossData.data.invoices.forEach((invoice: any) => {
				entries.push({
					id: `invoice-${invoice.id}`,
					date: invoice.date || invoice.createdAt || "",
					description: `Invoice Payment - ${invoice.invoice_number || invoice.id}`,
					type: "received",
					amount: invoice.total || 0,
				});
			});
		}

		// Add expenses (paid)
		if (profitLossData?.data?.expenses && profitLossData.data.expenses.length > 0) {
			profitLossData.data.expenses.forEach((expense: any) => {
				entries.push({
					id: `expense-${expense.id}`,
					date: expense.expenseDate || expense.createdAt || "",
					description: `Expense - ${expense.category || "Other"}`,
					type: "paid",
					amount: expense.amount || 0,
				});
			});
		}

		// Add payments (received) - filter by date range if dates are selected
		if (paymentsData?.data && Array.isArray(paymentsData.data)) {
			paymentsData.data.forEach((payment: any) => {
				const paymentDate = payment.paymentDate || payment.createdAt || "";
				if (fromDate && toDate) {
					const date = new Date(paymentDate);
					const from = new Date(fromDate);
					const to = new Date(toDate);
					if (date < from || date > to) {
						return; // Skip if outside date range
					}
				}
				entries.push({
					id: `payment-${payment.id}`,
					date: paymentDate,
					description: `Payment - ${payment.invoiceNumber || payment.invoice?.invoice_number || payment.id}`,
					type: "received",
					amount: payment.amount || 0,
				});
			});
		}

		// Sort by date
		entries.sort((a, b) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();
			return dateA - dateB;
		});

		// Calculate running balance
		let runningBalance = 0;
		return entries.map((entry) => {
			if (entry.type === "received") {
				runningBalance += entry.amount;
			} else {
				runningBalance -= entry.amount;
			}
			return {
				...entry,
				balance: runningBalance,
			};
		});
	}, [profitLossData?.data, paymentsData?.data, fromDate, toDate]);

	// Entries are already filtered by date in the API calls, but we can apply additional filtering if needed
	const filteredEntries = useMemo(() => {
		if (!fromDate || !toDate) return ledgerEntries;
		return ledgerEntries.filter((entry) => {
			const entryDate = new Date(entry.date);
			const from = new Date(fromDate);
			const to = new Date(toDate);
			// Include entries on the boundary dates
			return entryDate >= from && entryDate <= to;
		});
	}, [fromDate, toDate, ledgerEntries]);

	const totalReceived = useMemo(() => {
		return filteredEntries
			.filter((entry) => entry.type === "received")
			.reduce((sum, entry) => sum + entry.amount, 0);
	}, [filteredEntries]);

	const totalPaid = useMemo(() => {
		return filteredEntries
			.filter((entry) => entry.type === "paid")
			.reduce((sum, entry) => sum + entry.amount, 0);
	}, [filteredEntries]);

	const netBalance = totalReceived - totalPaid;

	// Calculate profit/loss table data from invoice products
	const profitLossTableData = useMemo(() => {
		if (!invoiceProductsQuery?.data || !inventoryQuery?.data || !productsQuery?.data) return [];

		const inventoryMap = new Map();
		const inventoryResponse = inventoryQuery.data as InventoryListResponse | undefined;
		const inventoryEntries = Array.isArray(inventoryResponse?.data)
			? inventoryResponse.data
			: Array.isArray(inventoryResponse)
				? inventoryResponse
				: [];

		// Create inventory map for quick lookup (productId -> cost price)
		// TODO: When backend adds costPrice to inventory, use it here
		// For now, we'll use product priceBook as fallback
		inventoryEntries.forEach((entry) => {
			inventoryMap.set(entry.productId, {
				hasInventory: true,
				// costPrice will be set from product priceBook below
			});
		});

		// Create product priceBook map for cost/selling price lookup
		const productPriceMap = new Map();
		productsQuery.data?.forEach((product: any) => {
			if (product.priceBook && product.priceBook.length > 0) {
				// Use first priceBook entry as default
				const priceBook = product.priceBook[0];
				productPriceMap.set(product.id, {
					costPrice: priceBook.price || 0, // Using price as cost for now
					sellingPrice: priceBook.sellPrice || priceBook.price || 0,
				});
			}
		});

		const profitLossRows: Array<{
			id: string;
			date: string;
			productName: string;
			quantity: number;
			costPrice: number;
			soldPrice: number;
			profitAmount: number;
			profitPercent: number;
		}> = [];

		// Process each invoice product
		// invoiceProductsQuery.data contains InvoiceProducts[] with invoice and product relations
		(invoiceProductsQuery.data as any[]).forEach((invoiceProduct: any) => {
			const invoice = invoiceProduct.invoice;
			if (!invoice) return;

			const invoiceDate = invoice.date || invoice.createdAt || "";

			// Filter by date range (already filtered by API, but double-check)
			if (fromDate && toDate) {
				const date = new Date(invoiceDate);
				const from = new Date(fromDate);
				const to = new Date(toDate);
				if (date < from || date > to) {
					return; // Skip if outside date range
				}
			}

			const productId = invoiceProduct.product_id;
			const product = invoiceProduct.product;
			const productName = product?.name || "Unknown Product";
			const quantity = invoiceProduct.quantity || 0;
			const soldPrice = invoiceProduct.price || 0; // Actual price used (handles inline changes)

			// Get cost price: from inventory if exists, otherwise from product priceBook
			// The invoice product price is the actual sold price (handles inline price changes)
			let costPrice = 0;

			// First try to get from product priceBook (this is the stock/cost price)
			if (productPriceMap.has(productId)) {
				costPrice = productPriceMap.get(productId).costPrice || 0;
			}

			// TODO: When backend adds costPrice to inventory, prioritize inventory cost price:
			// if (inventoryMap.has(productId)) {
			//   costPrice = inventoryMap.get(productId).costPrice || costPrice;
			// }

			// Calculate profit
			const profitAmount = (soldPrice - costPrice) * quantity;
			const profitPercent = costPrice > 0 ? ((soldPrice - costPrice) / costPrice) * 100 : 0;

			profitLossRows.push({
				id: `profit-${invoice.id}-${invoiceProduct.id}`,
				date: invoiceDate,
				productName,
				quantity,
				costPrice,
				soldPrice,
				profitAmount,
				profitPercent,
			});
		});

		// Sort by date
		profitLossRows.sort((a, b) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();
			return dateA - dateB;
		});

		return profitLossRows;
	}, [invoiceProductsQuery?.data, inventoryQuery?.data, productsQuery?.data, fromDate, toDate]);

	// Format date for display
	const formatDateDisplay = (date: string) => {
		if (!date) return "";
		return moment(date).format("MMM DD, YYYY");
	};

	// Get current date and time
	const dateGenerated = moment().format("MMM DD, YYYY, hh:mm A");

	// Download functionality
	const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
	const downloadMenuOpen = Boolean(downloadAnchorEl);
	const pdfExportRef = useRef<HTMLDivElement>(null);

	const handleDownloadClick = (event: React.MouseEvent<HTMLElement>) => {
		setDownloadAnchorEl(event.currentTarget);
	};

	const handleDownloadClose = () => {
		setDownloadAnchorEl(null);
	};

	// Prepare export data for profit/loss table
	const exportData = useMemo(() => {
		return profitLossTableData.map((row) => ({
			Date: parseDateStringToFormat(row.date, "MM/DD/YYYY"),
			"Sold Product Name": row.productName,
			Quantity: row.quantity,
			"Product Cost Price": row.costPrice,
			"Product Sold Price": row.soldPrice,
			"Profit Amount": row.profitAmount,
			"Profit Percent": `${row.profitPercent.toFixed(2)}%`,
		}));
	}, [profitLossTableData]);

	// CSV Export
	const handleDownloadCSV = () => {
		try {
			if (!exportData || exportData.length === 0) {
				handleDownloadClose();
				return;
			}

			const headers = [
				"Date",
				"Sold Product Name",
				"Quantity",
				"Product Cost Price",
				"Product Sold Price",
				"Profit Amount",
				"Profit Percent",
			];
			let csv = headers.join(",") + "\n";

			exportData.forEach((item) => {
				const row = [
					item.Date || "",
					`"${(item["Sold Product Name"] || "").replace(/"/g, '""')}"`,
					item.Quantity || "",
					item["Product Cost Price"] || "",
					item["Product Sold Price"] || "",
					item["Profit Amount"] || "",
					item["Profit Percent"] || "",
				].join(",");
				csv += row + "\n";
			});

			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Profit_Loss_Report_${moment().format("YYYY-MM-DD")}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			handleDownloadClose();
		} catch (error) {
			console.error("Error generating CSV file:", error);
			handleDownloadClose();
		}
	};

	// Excel Export
	const handleDownloadExcel = () => {
		try {
			if (!exportData || exportData.length === 0) {
				handleDownloadClose();
				return;
			}

			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Profit & Loss Report");

			const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
			const blob = new Blob([excelBuffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Profit_Loss_Report_${moment().format("YYYY-MM-DD")}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			handleDownloadClose();
		} catch (error) {
			console.error("Error generating Excel file:", error);
			handleDownloadClose();
		}
	};

	// XML Export
	const handleDownloadXML = () => {
		try {
			if (!exportData || exportData.length === 0) {
				handleDownloadClose();
				return;
			}

			const escapeXml = (str: any): string => {
				if (str === null || str === undefined) return "";
				return String(str)
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&apos;");
			};

			let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
			xml += "<ProfitLossReport>\n";
			xml += `  <ReportTitle>Today's Profit & Loss Report</ReportTitle>\n`;
			xml += `  <CompanyName>${escapeXml(user?.company?.[0]?.name || "")}</CompanyName>\n`;
			xml += `  <Date>${escapeXml(formatDateDisplay(fromDate))} (Today)</Date>\n`;
			xml += `  <DateGenerated>${escapeXml(dateGenerated)}</DateGenerated>\n`;
			xml += "  <Entries>\n";

			exportData.forEach((item, index) => {
				xml += `    <Entry id="${index + 1}">\n`;
				xml += `      <Date>${escapeXml(item.Date)}</Date>\n`;
				xml += `      <SoldProductName>${escapeXml(item["Sold Product Name"])}</SoldProductName>\n`;
				xml += `      <Quantity>${escapeXml(item.Quantity)}</Quantity>\n`;
				xml += `      <ProductCostPrice>${escapeXml(item["Product Cost Price"])}</ProductCostPrice>\n`;
				xml += `      <ProductSoldPrice>${escapeXml(item["Product Sold Price"])}</ProductSoldPrice>\n`;
				xml += `      <ProfitAmount>${escapeXml(item["Profit Amount"])}</ProfitAmount>\n`;
				xml += `      <ProfitPercent>${escapeXml(item["Profit Percent"])}</ProfitPercent>\n`;
				xml += "    </Entry>\n";
			});

			xml += "  </Entries>\n";
			xml += "</ProfitLossReport>";

			const blob = new Blob([xml], { type: "application/xml" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Profit_Loss_Report_${moment().format("YYYY-MM-DD")}.xml`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			handleDownloadClose();
		} catch (error) {
			console.error("Error generating XML file:", error);
			handleDownloadClose();
		}
	};

	// PDF Export
	const handleDownloadPDF = async () => {
		if (!pdfExportRef.current) return;

		LoaderService.instance.showLoader();
		try {
			const pdf = new jsPDF("portrait", "mm", "a4");
			const dpi = 300;
			const scale = dpi / 96;
			const pdfPageWidth = pdf.internal.pageSize.getWidth();
			const pdfPageHeight = pdf.internal.pageSize.getHeight();
			const margin = 10;
			const contentWidth = pdfPageWidth - margin * 2;
			const contentHeight = pdfPageHeight - margin * 2;

			const canvas = await html2canvas(pdfExportRef.current, {
				allowTaint: true,
				useCORS: true,
				scale: scale,
			});

			const imgData = canvas.toDataURL("image/png");
			const canvasAspectRatio = canvas.width / canvas.height;
			const imgWidthInPdf = contentWidth;
			const imgHeightInPdf = imgWidthInPdf / canvasAspectRatio;
			const totalPages = Math.ceil(imgHeightInPdf / contentHeight);

			let heightLeft = imgHeightInPdf;
			let yPosition = 0;

			for (let i = 0; i < totalPages; i++) {
				if (i > 0) {
					pdf.addPage();
				}
				pdf.addImage(imgData, "PNG", margin, yPosition + margin, imgWidthInPdf, imgHeightInPdf);
				heightLeft -= contentHeight;
				yPosition -= pdfPageHeight;
			}

			pdf.save(`Profit_Loss_Report_${moment().format("YYYY-MM-DD")}.pdf`);
		} catch (error) {
			console.error("Error generating PDF:", error);
		} finally {
			LoaderService.instance.hideLoader();
			handleDownloadClose();
		}
	};

	// Show loader while data is being fetched
	if (
		(profitLossData?.isLoading ||
			profitLossData?.isFetching ||
			invoiceProductsQuery?.isLoading ||
			inventoryQuery?.isLoading ||
			productsQuery?.isLoading) &&
		fromDate &&
		toDate
	) {
		return <Loader />;
	}

	return (
		<Box>
			{/* Hidden section for PDF export */}
			<Box
				ref={pdfExportRef}
				id="profit_loss_download_section"
				sx={{
					position: "absolute",
					left: "-9999px",
					width: "210mm",
					backgroundColor: "white",
					padding: "20mm",
				}}
			>
				{/* PDF Report Header */}
				<Box sx={{ mb: 3, textAlign: "center" }}>
					<Typography variant="h4" fontWeight={700} mb={1}>
						{t("ledger.todaysReport", { defaultValue: "Today's Ledger Report" })}
					</Typography>
					<Typography variant="body1" mb={1}>
						<strong>{t("ledger.companyName", { defaultValue: "Company" })}:</strong>{" "}
						{user?.company?.[0]?.name ||
							t("ledger.notAvailable", { defaultValue: "Not Available" })}
					</Typography>
					<Typography variant="body1" mb={1}>
						<strong>{t("ledger.address", { defaultValue: "Address" })}:</strong>{" "}
						{user?.company?.[0]?.address ||
							t("ledger.notAvailable", { defaultValue: "Not Available" })}
					</Typography>
					<Typography variant="body1" mb={1}>
						<strong>{t("ledger.email", { defaultValue: "Email" })}:</strong> {user?.email || ""}
					</Typography>
					<Typography variant="body1" mb={1}>
						<strong>{t("ledger.phone", { defaultValue: "Phone" })}:</strong> {user?.phone || ""}
					</Typography>
					<Typography variant="body1" mb={1}>
						<strong>{t("ledger.date", { defaultValue: "Date" })}:</strong>{" "}
						{formatDateDisplay(fromDate)} ({t("ledger.today", { defaultValue: "Today" })})
					</Typography>
					<Typography variant="body1" mb={1}>
						<strong>{t("ledger.dateGenerated", { defaultValue: "Date Generated" })}:</strong>{" "}
						{dateGenerated}
					</Typography>
				</Box>

				{/* PDF Profit/Loss Table */}
				<Box>
					<Typography variant="h5" fontWeight={600} mb={2} textAlign="center">
						{t("ledger.profitLossTable", { defaultValue: "Profit & Loss Report" })}
					</Typography>
					<table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
						<thead>
							<tr style={{ backgroundColor: "#f5f5f5" }}>
								<th
									style={{
										padding: "8px",
										textAlign: "left",
										borderBottom: "2px solid #ddd",
										border: "1px solid #ddd",
									}}
								>
									Date
								</th>
								<th
									style={{
										padding: "8px",
										textAlign: "left",
										borderBottom: "2px solid #ddd",
										border: "1px solid #ddd",
									}}
								>
									Sold Product Name
								</th>
								<th
									style={{
										padding: "8px",
										textAlign: "right",
										borderBottom: "2px solid #ddd",
										border: "1px solid #ddd",
									}}
								>
									Quantity
								</th>
								<th
									style={{
										padding: "8px",
										textAlign: "right",
										borderBottom: "2px solid #ddd",
										border: "1px solid #ddd",
									}}
								>
									Product Cost Price
								</th>
								<th
									style={{
										padding: "8px",
										textAlign: "right",
										borderBottom: "2px solid #ddd",
										border: "1px solid #ddd",
									}}
								>
									Product Sold Price
								</th>
								<th
									style={{
										padding: "8px",
										textAlign: "right",
										borderBottom: "2px solid #ddd",
										border: "1px solid #ddd",
									}}
								>
									Profit Amount
								</th>
								<th
									style={{
										padding: "8px",
										textAlign: "right",
										borderBottom: "2px solid #ddd",
										border: "1px solid #ddd",
									}}
								>
									Profit Percent
								</th>
							</tr>
						</thead>
						<tbody>
							{profitLossTableData.map((row) => (
								<tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
									<td style={{ padding: "8px", border: "1px solid #ddd" }}>
										{parseDateStringToFormat(row.date, "MM/DD/YYYY")}
									</td>
									<td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.productName}</td>
									<td style={{ padding: "8px", textAlign: "right", border: "1px solid #ddd" }}>
										{row.quantity}
									</td>
									<td style={{ padding: "8px", textAlign: "right", border: "1px solid #ddd" }}>
										{currencyFormatter(row.costPrice, user?.currency?.short_code)}
									</td>
									<td style={{ padding: "8px", textAlign: "right", border: "1px solid #ddd" }}>
										{currencyFormatter(row.soldPrice, user?.currency?.short_code)}
									</td>
									<td style={{ padding: "8px", textAlign: "right", border: "1px solid #ddd" }}>
										{currencyFormatter(row.profitAmount, user?.currency?.short_code)}
									</td>
									<td style={{ padding: "8px", textAlign: "right", border: "1px solid #ddd" }}>
										{row.profitPercent.toFixed(2)}%
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</Box>
			</Box>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexDirection: { xs: "column", md: "row" },
					mb: 3,
					gap: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<AccountBalanceIcon sx={{ fontSize: 40, color: "primary.main" }} />
					<Typography variant="h3" fontWeight={500} textTransform="capitalize">
						{t("ledger.todaysReport", { defaultValue: "Today's Ledger Report" })}
					</Typography>
				</Box>
			</Box>

			{/* Report Header Info */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Typography variant="h5" fontWeight={600} mb={2} textAlign="center">
								{t("ledger.todaysReport", { defaultValue: "Today's Ledger Report" })}
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								<strong>{t("ledger.companyName", { defaultValue: "Company Name" })}:</strong>{" "}
								{user?.company?.[0]?.name ||
									t("ledger.notAvailable", { defaultValue: "Not Available" })}
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								<strong>{t("ledger.email", { defaultValue: "Email" })}:</strong> {user?.email || ""}
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								<strong>{t("ledger.address", { defaultValue: "Address" })}:</strong>{" "}
								{user?.company?.[0]?.address ||
									t("ledger.notAvailable", { defaultValue: "Not Available" })}
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								<strong>{t("ledger.phone", { defaultValue: "Phone" })}:</strong> {user?.phone || ""}
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								<strong>{t("ledger.date", { defaultValue: "Date" })}:</strong>{" "}
								{formatDateDisplay(fromDate)} ({t("ledger.today", { defaultValue: "Today" })})
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant="body2" color="text.secondary">
								<strong>{t("ledger.dateGenerated", { defaultValue: "Date Generated" })}:</strong>{" "}
								{dateGenerated}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Summary Cards */}
			<Grid container spacing={2} mb={3}>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<TrendingUpIcon sx={{ color: "success.main" }} />
								<Typography variant="body2" color="text.secondary">
									{t("ledger.totalReceived", { defaultValue: "Total Received" })}
								</Typography>
							</Box>
							<Typography variant="h5" fontWeight={600} color="success.main">
								{currencyFormatter(totalReceived, user?.currency?.short_code)}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<TrendingDownIcon sx={{ color: "error.main" }} />
								<Typography variant="body2" color="text.secondary">
									{t("ledger.totalPaid", { defaultValue: "Total Paid" })}
								</Typography>
							</Box>
							<Typography variant="h5" fontWeight={600} color="error.main">
								{currencyFormatter(totalPaid, user?.currency?.short_code)}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<AccountBalanceIcon sx={{ color: "primary.main" }} />
								<Typography variant="body2" color="text.secondary">
									{t("ledger.netBalance", { defaultValue: "Net Balance" })}
								</Typography>
							</Box>
							<Typography
								variant="h5"
								fontWeight={600}
								color={netBalance >= 0 ? "success.main" : "error.main"}
							>
								{currencyFormatter(netBalance, user?.currency?.short_code)}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<BookIcon sx={{ color: "primary.main" }} />
								<Typography variant="body2" color="text.secondary">
									{t("ledger.profit", { defaultValue: "Profit" })}
								</Typography>
							</Box>
							<Typography variant="h5" fontWeight={600}>
								{currencyFormatter(netBalance, user?.currency?.short_code)}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* User Info - Hidden */}
			{/* <Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6" fontWeight={600} mb={2}>
						{t("ledger.userInfo", { defaultValue: "User Information" })}
					</Typography>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Typography variant="body2" color="text.secondary">
								{t("ledger.companyName", { defaultValue: "Company Name" })}
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{user?.company?.[0]?.name ||
									t("ledger.notAvailable", { defaultValue: "Not Available" })}
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography variant="body2" color="text.secondary">
								{t("ledger.email", { defaultValue: "Email" })}
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{user?.email || t("ledger.notAvailable", { defaultValue: "Not Available" })}
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography variant="body2" color="text.secondary">
								{t("ledger.currency", { defaultValue: "Currency" })}
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{user?.currency?.name ||
									t("ledger.notAvailable", { defaultValue: "Not Available" })}
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography variant="body2" color="text.secondary">
								{t("ledger.phone", { defaultValue: "Phone" })}
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{user?.phone || t("ledger.notAvailable", { defaultValue: "Not Available" })}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card> */}

			{/* Ledger Entries Table - Hidden */}
			{/* <Card>
				<CardContent>
					<Box
						sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
					>
						<Typography variant="h6" fontWeight={600}>
							{t("ledger.ledgerEntries", { defaultValue: "Ledger Entries" })}
						</Typography>
						<Box>
							<Button
								variant="contained"
								startIcon={<FileDownloadOutlinedIcon />}
								onClick={handleDownloadClick}
								size="small"
							>
								{t("ledger.download", { defaultValue: "Download" })}
							</Button>
							<Menu
								anchorEl={downloadAnchorEl}
								open={downloadMenuOpen}
								onClose={handleDownloadClose}
							>
								<MenuItem onClick={handleDownloadPDF} sx={{ pr: 6 }}>
									{t("ledger.downloadPDF", { defaultValue: "Download as PDF" })}
								</MenuItem>
								<MenuItem onClick={handleDownloadCSV} sx={{ pr: 6 }}>
									{t("ledger.downloadCSV", { defaultValue: "Download as CSV" })}
								</MenuItem>
								<MenuItem onClick={handleDownloadExcel} sx={{ pr: 6 }}>
									{t("ledger.downloadExcel", { defaultValue: "Download as Excel" })}
								</MenuItem>
								<MenuItem onClick={handleDownloadXML} sx={{ pr: 6 }}>
									{t("ledger.downloadXML", { defaultValue: "Download as XML" })}
								</MenuItem>
							</Menu>
						</Box>
					</Box>
					{filteredEntries.length === 0 ? (
						<Box sx={{ textAlign: "center", py: 4 }}>
							<Typography variant="body1" color="text.secondary">
								{t("ledger.noEntries", {
									defaultValue: "No ledger entries found for the selected date range.",
								})}
							</Typography>
						</Box>
					) : (
						<Paper variant="outlined">
							<Box sx={{ overflowX: "auto" }}>
								<table style={{ width: "100%", borderCollapse: "collapse" }}>
									<thead>
										<tr style={{ backgroundColor: "#f5f5f5" }}>
											<th
												style={{
													padding: "12px",
													textAlign: "left",
													borderBottom: "2px solid #ddd",
												}}
											>
												<Typography variant="subtitle2" fontWeight={600}>
													{t("ledger.date", { defaultValue: "Date" })}
												</Typography>
											</th>
											<th
												style={{
													padding: "12px",
													textAlign: "left",
													borderBottom: "2px solid #ddd",
												}}
											>
												<Typography variant="subtitle2" fontWeight={600}>
													{t("ledger.description", { defaultValue: "Description" })}
												</Typography>
											</th>
											<th
												style={{
													padding: "12px",
													textAlign: "right",
													borderBottom: "2px solid #ddd",
												}}
											>
												<Typography variant="subtitle2" fontWeight={600}>
													{t("ledger.received", { defaultValue: "Received" })}
												</Typography>
											</th>
											<th
												style={{
													padding: "12px",
													textAlign: "right",
													borderBottom: "2px solid #ddd",
												}}
											>
												<Typography variant="subtitle2" fontWeight={600}>
													{t("ledger.paid", { defaultValue: "Paid" })}
												</Typography>
											</th>
											<th
												style={{
													padding: "12px",
													textAlign: "right",
													borderBottom: "2px solid #ddd",
												}}
											>
												<Typography variant="subtitle2" fontWeight={600}>
													{t("ledger.balance", { defaultValue: "Balance" })}
												</Typography>
											</th>
										</tr>
									</thead>
									<tbody>
										{filteredEntries.map((entry, index) => (
											<tr
												key={entry.id}
												style={{
													borderBottom:
														index < filteredEntries.length - 1 ? "1px solid #eee" : "none",
												}}
											>
												<td style={{ padding: "12px" }}>
													<Typography variant="body2">
														{new Date(entry.date).toLocaleDateString()}
													</Typography>
												</td>
												<td style={{ padding: "12px" }}>
													<Typography variant="body2">{entry.description}</Typography>
												</td>
												<td style={{ padding: "12px", textAlign: "right" }}>
													<Typography
														variant="body2"
														color={entry.type === "received" ? "success.main" : "transparent"}
														fontWeight={entry.type === "received" ? 500 : 400}
													>
														{entry.type === "received"
															? currencyFormatter(entry.amount, user?.currency?.short_code)
															: "-"}
													</Typography>
												</td>
												<td style={{ padding: "12px", textAlign: "right" }}>
													<Typography
														variant="body2"
														color={entry.type === "paid" ? "error.main" : "transparent"}
														fontWeight={entry.type === "paid" ? 500 : 400}
													>
														{entry.type === "paid"
															? currencyFormatter(entry.amount, user?.currency?.short_code)
															: "-"}
													</Typography>
												</td>
												<td style={{ padding: "12px", textAlign: "right" }}>
													<Typography variant="body2" fontWeight={500}>
														{currencyFormatter(entry.balance, user?.currency?.short_code)}
													</Typography>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</Box>
						</Paper>
					)}
				</CardContent>
			</Card> */}

			{/* Profit/Loss Table */}
			<Card sx={{ mt: 3 }}>
				<CardContent>
					<Box
						sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
					>
						<Typography variant="h6" fontWeight={600}>
							{t("ledger.profitLossTable", { defaultValue: "Profit & Loss Report" })}
						</Typography>
						<Box>
							<Button
								variant="contained"
								startIcon={<FileDownloadOutlinedIcon />}
								onClick={handleDownloadClick}
								size="small"
							>
								{t("ledger.download", { defaultValue: "Download" })}
							</Button>
							<Menu
								anchorEl={downloadAnchorEl}
								open={downloadMenuOpen}
								onClose={handleDownloadClose}
							>
								<MenuItem onClick={handleDownloadPDF} sx={{ pr: 6 }}>
									{t("ledger.downloadPDF", { defaultValue: "Download as PDF" })}
								</MenuItem>
								<MenuItem onClick={handleDownloadCSV} sx={{ pr: 6 }}>
									{t("ledger.downloadCSV", { defaultValue: "Download as CSV" })}
								</MenuItem>
								<MenuItem onClick={handleDownloadExcel} sx={{ pr: 6 }}>
									{t("ledger.downloadExcel", { defaultValue: "Download as Excel" })}
								</MenuItem>
								<MenuItem onClick={handleDownloadXML} sx={{ pr: 6 }}>
									{t("ledger.downloadXML", { defaultValue: "Download as XML" })}
								</MenuItem>
							</Menu>
						</Box>
					</Box>
					{profitLossTableData.length === 0 ? (
						<Box sx={{ textAlign: "center", py: 4 }}>
							<Typography variant="body1" color="text.secondary">
								{t("ledger.noProfitLossData", {
									defaultValue: "No profit/loss data found Today.",
								})}
							</Typography>
						</Box>
					) : (
						<TableContainer component={Paper} variant="outlined">
							<Table>
								<TableHead>
									<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
										<TableCell>
											<Typography variant="subtitle2" fontWeight={600}>
												{t("ledger.profitLoss.date", { defaultValue: "Date" })}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="subtitle2" fontWeight={600}>
												{t("ledger.profitLoss.productName", {
													defaultValue: "Sold Product Name",
												})}
											</Typography>
										</TableCell>
										<TableCell align="right">
											<Typography variant="subtitle2" fontWeight={600}>
												{t("ledger.profitLoss.quantity", { defaultValue: "Quantity" })}
											</Typography>
										</TableCell>
										<TableCell align="right">
											<Typography variant="subtitle2" fontWeight={600}>
												{t("ledger.profitLoss.costPrice", {
													defaultValue: "Product Cost Price",
												})}
											</Typography>
										</TableCell>
										<TableCell align="right">
											<Typography variant="subtitle2" fontWeight={600}>
												{t("ledger.profitLoss.soldPrice", {
													defaultValue: "Product Sold Price",
												})}
											</Typography>
										</TableCell>
										<TableCell align="right">
											<Typography variant="subtitle2" fontWeight={600}>
												{t("ledger.profitLoss.profitAmount", {
													defaultValue: "Profit Amount",
												})}
											</Typography>
										</TableCell>
										<TableCell align="right">
											<Typography variant="subtitle2" fontWeight={600}>
												{t("ledger.profitLoss.profitPercent", {
													defaultValue: "Profit Percent",
												})}
											</Typography>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{profitLossTableData.map((row) => (
										<TableRow key={row.id} hover>
											<TableCell>
												<Typography variant="body2">
													{parseDateStringToFormat(row.date, "MM/DD/YYYY")}
												</Typography>
											</TableCell>
											<TableCell>
												<Typography variant="body2" fontWeight={500}>
													{row.productName}
												</Typography>
											</TableCell>
											<TableCell align="right">
												<Typography variant="body2">{row.quantity}</Typography>
											</TableCell>
											<TableCell align="right">
												<Typography variant="body2">
													{currencyFormatter(row.costPrice, user?.currency?.short_code)}
												</Typography>
											</TableCell>
											<TableCell align="right">
												<Typography variant="body2" fontWeight={500}>
													{currencyFormatter(row.soldPrice, user?.currency?.short_code)}
												</Typography>
											</TableCell>
											<TableCell align="right">
												<Typography
													variant="body2"
													fontWeight={600}
													color={row.profitAmount >= 0 ? "success.main" : "error.main"}
												>
													{currencyFormatter(row.profitAmount, user?.currency?.short_code)}
												</Typography>
											</TableCell>
											<TableCell align="right">
												<Typography
													variant="body2"
													fontWeight={600}
													color={row.profitPercent >= 0 ? "success.main" : "error.main"}
													sx={{
														backgroundColor: row.profitPercent >= 0 ? "#e8f5e9" : "#ffebee",
														padding: "4px 8px",
														borderRadius: "4px",
														display: "inline-block",
													}}
												>
													{row.profitPercent.toFixed(2)}%
												</Typography>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</CardContent>
			</Card>

			{/* Info Card - Hidden */}
			{/* <Card sx={{ mt: 3 }}>
				<CardContent>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
						<BookIcon sx={{ fontSize: 28, color: "primary.main" }} />
						<Typography variant="h5" fontWeight={600}>
							{t("ledger.whatIsLedger", { defaultValue: "What is a Ledger?" })}
						</Typography>
					</Box>
					<Typography variant="body1" color="text.secondary" paragraph>
						{t("ledger.ledgerDescription", {
							defaultValue:
								"A ledger is a book in which a company, bank, etc. records the money it has paid and received. It provides a detailed chronological record of all financial transactions, helping you track your business's financial health and maintain accurate accounting records.",
						})}
					</Typography>
				</CardContent>
			</Card> */}
		</Box>
	);
};

export default Ledger;
