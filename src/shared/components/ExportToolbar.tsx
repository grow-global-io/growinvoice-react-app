import { Button, Menu, MenuItem } from "@mui/material";
import { GridToolbarContainer } from "@mui/x-data-grid";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";

interface ExportToolbarProps {
	exportData: any[];
	fileName?: string;
}

/**
 * Reusable Export Toolbar Component
 * Provides CSV, Excel, and XML export functionality
 * Can be used across different pages/components
 */
export function ExportToolbar({ exportData, fileName = "export" }: ExportToolbarProps) {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	// Convert JSON data to CSV format
	const convertToCSV = useCallback((data: any[]): string => {
		if (!data || data.length === 0) {
			return "";
		}

		// Get all unique keys (column headers) from the data
		const allKeys = new Set<string>();
		data.forEach((item) => {
			if (item && typeof item === "object") {
				Object.keys(item).forEach((key) => allKeys.add(key));
			}
		});

		const headers = Array.from(allKeys);

		// Escape CSV values (handle commas, quotes, newlines)
		const escapeCsvValue = (value: any): string => {
			if (value === null || value === undefined) {
				return "";
			}
			const stringValue = String(value);
			// If value contains comma, quote, or newline, wrap in quotes and escape quotes
			if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
				return `"${stringValue.replace(/"/g, '""')}"`;
			}
			return stringValue;
		};

		// Build CSV content
		let csv = headers.map(escapeCsvValue).join(",") + "\n";

		data.forEach((item) => {
			const row = headers.map((header) => escapeCsvValue(item[header])).join(",");
			csv += row + "\n";
		});

		return csv;
	}, []);

	// Handle CSV export
	const handleCreatCsvFile = useCallback(() => {
		try {
			const csvContent = convertToCSV(exportData);
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${fileName}_${new Date().getTime()}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			handleClose();
		} catch (error) {
			console.error("Error generating CSV file:", error);
			handleClose();
		}
	}, [exportData, convertToCSV, fileName, handleClose]);

	// Handle Excel export
	const handleCreatExcelFile = useCallback(() => {
		try {
			if (!exportData || exportData.length === 0) {
				handleClose();
				return;
			}

			// Create a workbook and worksheet
			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

			// Generate Excel file and download
			const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
			const blob = new Blob([excelBuffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${fileName}_${new Date().getTime()}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			handleClose();
		} catch (error) {
			console.error("Error generating Excel file:", error);
			handleClose();
		}
	}, [exportData, fileName, handleClose]);

	// Convert JSON data to XML format
	const convertToXML = useCallback((data: any[]): string => {
		if (!data || data.length === 0) {
			return '<?xml version="1.0" encoding="UTF-8"?><data></data>';
		}

		const allKeys = new Set<string>();
		data.forEach((item) => {
			if (item && typeof item === "object") {
				Object.keys(item).forEach((key) => allKeys.add(key));
			}
		});

		const escapeXml = (str: any): string => {
			if (str === null || str === undefined) {
				return "";
			}
			const stringValue = String(str);
			return stringValue
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&apos;");
		};

		const toXmlTagName = (key: string): string => {
			return key
				.replace(/[^a-zA-Z0-9_]/g, "_")
				.replace(/^[0-9]/, "_$&")
				.replace(/^$/, "item");
		};

		let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
		xml += "<data>\n";

		data.forEach((item, index) => {
			xml += `  <row id="${index + 1}">\n`;
			if (item && typeof item === "object") {
				Object.keys(item).forEach((key) => {
					const tagName = toXmlTagName(key);
					const value = item[key];
					const xmlValue = escapeXml(value);
					xml += `    <${tagName}>${xmlValue}</${tagName}>\n`;
				});
			}
			xml += "  </row>\n";
		});

		xml += "</data>";
		return xml;
	}, []);

	// Handle XML export
	const handleCreatXmlFile = useCallback(() => {
		try {
			const xmlContent = convertToXML(exportData);
			const blob = new Blob([xmlContent], { type: "application/xml" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${fileName}_${new Date().getTime()}.xml`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			handleClose();
		} catch (error) {
			console.error("Error generating XML file:", error);
			handleClose();
		}
	}, [exportData, convertToXML, fileName, handleClose]);

	return (
		<>
			<GridToolbarContainer
				sx={{
					display: "flex",
					justifyContent: "flex-end",
					alignItems: "center",
					px: 1,
					pb: 0,
				}}
			>
				<Button onClick={handleClick}>
					<FileDownloadOutlinedIcon />
					{t("report.export.title", { defaultValue: "Export" })}
				</Button>
			</GridToolbarContainer>
			<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
				<MenuItem onClick={handleCreatCsvFile} sx={{ pr: 6 }}>
					{t("report.export.csv", { defaultValue: "Download as CSV" })}
				</MenuItem>
				<MenuItem onClick={handleCreatExcelFile} sx={{ pr: 6 }}>
					{t("report.export.excel", { defaultValue: "Download as Excel" })}
				</MenuItem>
				<MenuItem onClick={handleCreatXmlFile} sx={{ pr: 6 }}>
					{t("report.export.xml", { defaultValue: "Download as XML" })}
				</MenuItem>
			</Menu>
		</>
	);
}
