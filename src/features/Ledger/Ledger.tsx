import {
	Box,
	Card,
	CardContent,
	Grid,
	Typography,
	Paper,
	Button,
	Menu,
	MenuItem,
	Divider,
} from "@mui/material";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { useState, useMemo, useEffect, useRef } from "react";
import { type DayRange } from "@hassanmojab/react-modern-calendar-datepicker";
import DatePicker from "@hassanmojab/react-modern-calendar-datepicker";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@store/auth";
import { convertUtcToFormat, parseDateStringToFormat } from "@shared/formatter";
import { currencyFormatter } from "@shared/formatter";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BookIcon from "@mui/icons-material/Book";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useReportsControllerGetProfitLossReports } from "@api/services/reports";
import { usePaymentsControllerFindAll } from "@api/services/payments";
import Loader from "@shared/components/Loader";
import { useReportsControllerGetProfitLossRange } from "@api/services/reports";
import { LoaderService } from "@shared/services/LoaderService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import moment from "moment";

const Ledger = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [dayRange, setDayRange] = useState<DayRange>({
		from: null,
		to: null,
	});

	// Get date range from API
	const dateRange = useReportsControllerGetProfitLossRange();

	// Initialize date range from API
	useEffect(() => {
		if (dateRange?.data?.start && dateRange?.data?.end && !dayRange.from && !dayRange.to) {
			setDayRange({
				from: {
					day: parseInt(parseDateStringToFormat(dateRange.data.start, "DD")),
					month: parseInt(parseDateStringToFormat(dateRange.data.start, "MM")),
					year: parseInt(parseDateStringToFormat(dateRange.data.start, "YYYY")),
				},
				to: {
					day: parseInt(parseDateStringToFormat(dateRange.data.end, "DD")),
					month: parseInt(parseDateStringToFormat(dateRange.data.end, "MM")),
					year: parseInt(parseDateStringToFormat(dateRange.data.end, "YYYY")),
				},
			});
		}
	}, [dateRange?.data]);

	const fromDate = useMemo(() => {
		if (dayRange.from) {
			return convertUtcToFormat(
				`${dayRange.from.year}-${dayRange.from.month}-${dayRange.from.day}`,
				"iso",
			);
		}
		return "";
	}, [dayRange.from]);

	const toDate = useMemo(() => {
		if (dayRange.to) {
			return convertUtcToFormat(
				`${dayRange.to.year}-${dayRange.to.month}-${dayRange.to.day}`,
				"iso",
			);
		}
		return "";
	}, [dayRange.to]);

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

	// Format date for display
	const formatDateDisplay = (date: string) => {
		if (!date) return "";
		return moment(date).format("MMM DD, YYYY");
	};

	// Get current date and time
	const dateGenerated = moment().format("MMM DD, YYYY, hh:mm A");

	// Prepare export data
	const exportData = useMemo(() => {
		return filteredEntries.map((entry) => ({
			Date: parseDateStringToFormat(entry.date, "MM/DD/YYYY"),
			Description: entry.description,
			Received: entry.type === "received" ? entry.amount : "",
			Paid: entry.type === "paid" ? entry.amount : "",
			Balance: entry.balance,
		}));
	}, [filteredEntries]);

	// CSV Export
	const handleDownloadCSV = () => {
		try {
			if (!exportData || exportData.length === 0) {
				handleDownloadClose();
				return;
			}

			const headers = ["Date", "Description", "Received", "Paid", "Balance"];
			let csv = headers.join(",") + "\n";

			exportData.forEach((item) => {
				const row = [
					item.Date || "",
					`"${(item.Description || "").replace(/"/g, '""')}"`,
					item.Received || "",
					item.Paid || "",
					item.Balance || "",
				].join(",");
				csv += row + "\n";
			});

			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Ledger_Report_${moment().format("YYYY-MM-DD")}.csv`;
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
			XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger Report");

			const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
			const blob = new Blob([excelBuffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Ledger_Report_${moment().format("YYYY-MM-DD")}.xlsx`;
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
			xml += "<LedgerReport>\n";
			xml += `  <ReportTitle>General Ledger Report</ReportTitle>\n`;
			xml += `  <CompanyName>${escapeXml(user?.company?.[0]?.name || "")}</CompanyName>\n`;
			xml += `  <DateRange>${escapeXml(formatDateDisplay(fromDate))} - ${escapeXml(formatDateDisplay(toDate))}</DateRange>\n`;
			xml += `  <DateGenerated>${escapeXml(dateGenerated)}</DateGenerated>\n`;
			xml += "  <Entries>\n";

			exportData.forEach((item, index) => {
				xml += `    <Entry id="${index + 1}">\n`;
				xml += `      <Date>${escapeXml(item.Date)}</Date>\n`;
				xml += `      <Description>${escapeXml(item.Description)}</Description>\n`;
				xml += `      <Received>${escapeXml(item.Received)}</Received>\n`;
				xml += `      <Paid>${escapeXml(item.Paid)}</Paid>\n`;
				xml += `      <Balance>${escapeXml(item.Balance)}</Balance>\n`;
				xml += "    </Entry>\n";
			});

			xml += "  </Entries>\n";
			xml += "</LedgerReport>";

			const blob = new Blob([xml], { type: "application/xml" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Ledger_Report_${moment().format("YYYY-MM-DD")}.xml`;
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

			pdf.save(`Ledger_Report_${moment().format("YYYY-MM-DD")}.pdf`);
		} catch (error) {
			console.error("Error generating PDF:", error);
		} finally {
			LoaderService.instance.hideLoader();
			handleDownloadClose();
		}
	};

	// Show loader while data is being fetched
	if ((profitLossData?.isLoading || profitLossData?.isFetching) && fromDate && toDate) {
		return <Loader />;
	}

	return (
		<Box>
			{/* Hidden section for PDF export */}
			<Box
				ref={pdfExportRef}
				id="tm_download_section"
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
						{t("ledger.reportTitle", { defaultValue: "General Ledger Report" })}
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
					<Divider sx={{ my: 2 }} />
					<Typography variant="body1" mb={1}>
						<strong>{t("ledger.dateRange", { defaultValue: "Date Range" })}:</strong>{" "}
						{formatDateDisplay(fromDate)} - {formatDateDisplay(toDate)}
					</Typography>
					<Typography variant="body1" mb={1}>
						<strong>{t("ledger.dateGenerated", { defaultValue: "Date Generated" })}:</strong>{" "}
						{dateGenerated}
					</Typography>
				</Box>

				{/* PDF Report Content */}
				<Box>
					{/* Summary */}
					<Grid container spacing={2} mb={3}>
						<Grid item xs={6}>
							<Typography variant="body2">
								<strong>{t("ledger.totalReceived", { defaultValue: "Total Received" })}:</strong>{" "}
								{currencyFormatter(totalReceived, user?.currency?.short_code)}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography variant="body2">
								<strong>{t("ledger.totalPaid", { defaultValue: "Total Paid" })}:</strong>{" "}
								{currencyFormatter(totalPaid, user?.currency?.short_code)}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography variant="body2">
								<strong>{t("ledger.netBalance", { defaultValue: "Net Balance" })}:</strong>{" "}
								{currencyFormatter(netBalance, user?.currency?.short_code)}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography variant="body2">
								<strong>{t("ledger.profit", { defaultValue: "Profit" })}:</strong>{" "}
								{currencyFormatter(netBalance, user?.currency?.short_code)}
							</Typography>
						</Grid>
					</Grid>

					{/* Ledger Entries Table */}
					<table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
						<thead>
							<tr style={{ backgroundColor: "#f5f5f5" }}>
								<th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>
									{t("ledger.date", { defaultValue: "Date" })}
								</th>
								<th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>
									{t("ledger.description", { defaultValue: "Description" })}
								</th>
								<th style={{ padding: "8px", textAlign: "right", borderBottom: "2px solid #ddd" }}>
									{t("ledger.received", { defaultValue: "Received" })}
								</th>
								<th style={{ padding: "8px", textAlign: "right", borderBottom: "2px solid #ddd" }}>
									{t("ledger.paid", { defaultValue: "Paid" })}
								</th>
								<th style={{ padding: "8px", textAlign: "right", borderBottom: "2px solid #ddd" }}>
									{t("ledger.balance", { defaultValue: "Balance" })}
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredEntries.map((entry) => (
								<tr key={entry.id} style={{ borderBottom: "1px solid #eee" }}>
									<td style={{ padding: "8px" }}>
										{parseDateStringToFormat(entry.date, "MM/DD/YYYY")}
									</td>
									<td style={{ padding: "8px" }}>{entry.description}</td>
									<td style={{ padding: "8px", textAlign: "right" }}>
										{entry.type === "received"
											? currencyFormatter(entry.amount, user?.currency?.short_code)
											: "-"}
									</td>
									<td style={{ padding: "8px", textAlign: "right" }}>
										{entry.type === "paid"
											? currencyFormatter(entry.amount, user?.currency?.short_code)
											: "-"}
									</td>
									<td style={{ padding: "8px", textAlign: "right" }}>
										{currencyFormatter(entry.balance, user?.currency?.short_code)}
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
						{t("ledger.title", { defaultValue: "Ledger Information" })}
					</Typography>
				</Box>
				<Box sx={{ width: { xs: "100%", md: "300px" } }}>
					<Typography variant="h6" fontWeight={500} textTransform="capitalize" mb={1}>
						{t("ledger.selectDateRange", { defaultValue: "Select Date Range" })}
					</Typography>
					<Box
						sx={{
							position: "relative",
							"& .DatePicker": {
								width: "100%",
							},
							"& .DatePicker__input": {
								width: "100%",
								cursor: "pointer",
							},
						}}
					>
						<DatePicker
							value={dayRange}
							onChange={setDayRange}
							shouldHighlightWeekends
							locale="en"
						/>
					</Box>
				</Box>
			</Box>

			{/* Report Header Info */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Typography variant="h5" fontWeight={600} mb={2} textAlign="center">
								{t("ledger.reportTitle", { defaultValue: "General Ledger Report" })}
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
								<strong>{t("ledger.dateRange", { defaultValue: "Date Range" })}:</strong>{" "}
								{formatDateDisplay(fromDate)} - {formatDateDisplay(toDate)}
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

			{/* User Info */}
			<Card sx={{ mb: 3 }}>
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
			</Card>

			{/* Ledger Entries Table */}
			<Card>
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
			</Card>

			{/* Info Card */}
			<Card sx={{ mt: 3 }}>
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
			</Card>
		</Box>
	);
};

export default Ledger;
