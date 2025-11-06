import {
	useJson2excelControllerCreate,
	useJson2excelControllerCreateCsv,
} from "@api/services/json2excel";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Button, Menu, MenuItem } from "@mui/material";
import { GridToolbarContainer } from "@mui/x-data-grid";
import React from "react";
import { useTranslation } from "react-i18next";

export function CustomToolbar({
	rows,
}: {
	// eslint-disable-next-line
	rows: any;
}) {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const creatExcelFile = useJson2excelControllerCreate();
	const handleCreatExcelFile = async () => {
		const response = await creatExcelFile.mutateAsync({ data: rows ?? [] });
		window.open(response?.link);
		handleClose();
	};
	const creatCsvFile = useJson2excelControllerCreateCsv();
	const handleCreatCsvFile = async () => {
		const response = await creatCsvFile.mutateAsync({ data: rows ?? [] });
		window.open(response?.link as string);
		handleClose();
	};

	// Convert JSON data to XML format
	const convertToXML = (data: any[]): string => {
		if (!data || data.length === 0) {
			return '<?xml version="1.0" encoding="UTF-8"?><data></data>';
		}

		// Get all unique keys from all objects
		const allKeys = new Set<string>();
		data.forEach((item) => {
			if (item && typeof item === "object") {
				Object.keys(item).forEach((key) => allKeys.add(key));
			}
		});

		// Escape XML special characters
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

		// Convert object key to valid XML tag name
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
	};

	// Handle XML download
	const handleCreatXmlFile = () => {
		try {
			const xmlContent = convertToXML(rows ?? []);
			const blob = new Blob([xmlContent], { type: "application/xml" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `export_${new Date().getTime()}.xml`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			handleClose();
		} catch (error) {
			console.error("Error generating XML file:", error);
			handleClose();
		}
	};

	const menuLists = [
		{
			name: t("report.export.csv", { defaultValue: "Download as CSV" }),
			func: handleCreatCsvFile,
		},
		{
			name: t("report.export.excel", { defaultValue: "Download as Excel" }),
			func: handleCreatExcelFile,
		},
		{
			name: t("report.export.xml", { defaultValue: "Download as XML" }),
			func: handleCreatXmlFile,
		},
	];

	return (
		<>
			<GridToolbarContainer>
				<Button onClick={handleClick}>
					<FileDownloadOutlinedIcon />
					{t("report.export.title", { defaultValue: "Export" })}
				</Button>
			</GridToolbarContainer>
			<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
				{menuLists.map((item, index) => (
					<MenuItem onClick={item.func} sx={{ pr: 6 }} key={index}>
						{item.name}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
