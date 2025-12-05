import Box from "@mui/material/Box";
import {
	DataGrid,
	type GridColDef,
	GridToolbarQuickFilter,
	GridToolbarContainer,
} from "@mui/x-data-grid";
import { Chip, Tooltip, Typography, Button, Menu, MenuItem } from "@mui/material";
import {
	getCustomerControllerFindAllQueryKey,
	useCustomerControllerFindAll,
	useCustomerControllerRemove,
} from "@api/services/customer";
import Loader from "@shared/components/Loader";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
// import React from "react";
// import { useDialog } from "@shared/hooks/useDialog";
// import CustomerView from "./CustomerView";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type GetCustomerWithAddressDto } from "@api/services/models";
import { useMemo, useState, useCallback } from "react";
import React from "react";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useCurrencyControllerFindCountries } from "@api/services/currency";
import * as XLSX from "xlsx";

const CustomerTableList = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const CustomerData = useCustomerControllerFindAll();
	const countryFindAll = useCurrencyControllerFindCountries();
	const { updateCustomer } = useCreateCustomerStore.getState();
	const removeCustomer = useCustomerControllerRemove();
	const { handleOpen, cleanUp } = useConfirmDialogStore();

	// All hooks must be called before any conditional returns
	// Prepare export data with the requested format (with translated column headers)
	const exportData = useMemo(() => {
		// Get translated column headers
		const columnHeaders = {
			name: t("report.export.customerExport.name", { defaultValue: "Name" }),
			countryCode: t("report.export.customerExport.countryCode", { defaultValue: "Country code" }),
			contactPerson: t("report.export.customerExport.contactPerson", {
				defaultValue: "Contact person",
			}),
			streetAddress: t("report.export.customerExport.streetAddress", {
				defaultValue: "Street address",
			}),
			streetAddressLine2: t("report.export.customerExport.streetAddressLine2", {
				defaultValue: "Street address, line 2",
			}),
			postalCode: t("report.export.customerExport.postalCode", { defaultValue: "Postal code" }),
			cityMunicipality: t("report.export.customerExport.cityMunicipality", {
				defaultValue: "City/municipality",
			}),
			phoneNumber: t("report.export.customerExport.phoneNumber", { defaultValue: "Phone number" }),
			emailAddress: t("report.export.customerExport.emailAddress", {
				defaultValue: "Email address",
			}),
			numberOfShippingUnits: t("report.export.customerExport.numberOfShippingUnits", {
				defaultValue: "Number of shipping units",
			}),
		};

		return (
			CustomerData?.data?.map((item) => {
				// Prefer billing address, fallback to shipping address
				const address = item.billingAddress || item.shippingAddress;

				// Get country code from country_id
				let countryCode = "";
				if (address?.country_id && countryFindAll?.data) {
					const country = countryFindAll.data.find((c) => c.id === address.country_id);
					countryCode = country?.code || address?.country_name || "";
				} else if (address?.country_name) {
					countryCode = address.country_name;
				}

				return {
					[columnHeaders.name]: item.name || "",
					[columnHeaders.countryCode]: countryCode,
					[columnHeaders.contactPerson]: item.display_name || item.name || "",
					[columnHeaders.streetAddress]: address?.address || "",
					[columnHeaders.streetAddressLine2]: "", // Not available in data structure
					[columnHeaders.postalCode]: address?.zip || "",
					[columnHeaders.cityMunicipality]: address?.city || "",
					[columnHeaders.phoneNumber]: item.phone || "",
					[columnHeaders.emailAddress]: item.email || "",
					[columnHeaders.numberOfShippingUnits]: "", // Not available in data structure
				};
			}) ?? []
		);
	}, [CustomerData?.data, countryFindAll?.data, t]);

	// Export functionality hooks
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleCreatExcelFile = useCallback(() => {
		try {
			if (!exportData || exportData.length === 0) {
				handleClose();
				return;
			}

			// Create a workbook and worksheet
			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

			// Generate Excel file and download
			const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
			const blob = new Blob([excelBuffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `customers_export_${new Date().getTime()}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			handleClose();
		} catch (error) {
			console.error("Error generating Excel file:", error);
			handleClose();
		}
	}, [exportData, handleClose]);

	// Convert JSON data to CSV format (frontend generation to preserve translations)
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

	const handleCreatCsvFile = useCallback(() => {
		try {
			const csvContent = convertToCSV(exportData);
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `customers_export_${new Date().getTime()}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			handleClose();
		} catch (error) {
			console.error("Error generating CSV file:", error);
			handleClose();
		}
	}, [exportData, convertToCSV, handleClose]);

	// Convert JSON data to XML format
	const convertToXML = (data: any[]): string => {
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
	};

	const handleCreatXmlFile = useCallback(() => {
		try {
			const xmlContent = convertToXML(exportData);
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
	}, [exportData, handleClose]);

	// Combined toolbar with search and export
	const CombinedToolbar = useCallback(() => {
		return (
			<>
				<GridToolbarContainer
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						px: 1,
						pb: 0,
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
						}}
					>
						<GridToolbarQuickFilter
							variant="outlined"
							quickFilterParser={(input) => input.split(/\s+/).filter(Boolean)}
							placeholder={t("common.search", { defaultValue: "Search" }) as string}
						/>
					</Box>
					<Box>
						<Button onClick={handleClick}>
							<FileDownloadOutlinedIcon />
							{t("report.export.title", { defaultValue: "Export" })}
						</Button>
					</Box>
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
	}, [
		t,
		anchorEl,
		open,
		handleClick,
		handleClose,
		handleCreatCsvFile,
		handleCreatExcelFile,
		handleCreatXmlFile,
	]);

	const columns: GridColDef<GetCustomerWithAddressDto>[] = [
		{
			field: "name",
			headerName: t("customer.table.fullName", { defaultValue: "Full Name" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography
						variant="h6"
						color="secondary"
						textTransform={"capitalize"}
						sx={{ cursor: "pointer" }}
						onClick={() => {
							// openCustomerView(params.row.id);
							navigate(`/invoice/customer/${params.row.id}`);
						}}
					>
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "source",
			headerName: t("customer.table.source", { defaultValue: "Source" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Chip
						label={
							params.row.fromStore
								? t("customer.table.store", { defaultValue: "Store" })
								: t("customer.table.direct", { defaultValue: "Direct" })
						}
						variant="filled"
						color="primary"
					/>
				);
			},
		},
		{
			field: "email",
			headerName: t("customer.table.contactEmail", { defaultValue: "Contact Email" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "phone",
			headerName: t("customer.table.contactNumber", { defaultValue: "Contact Number" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "_count",
			headerName: t("customer.table.invoiceCount", { defaultValue: "Invoice" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params?.value?.invoice}</Typography>;
			},
		},

		{
			field: "totalDue",
			headerName: t("customer.table.amountDue", { defaultValue: "Amount Due" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Chip label={params?.value} variant="filled" color={"error"} />;
			},
		},
		{
			field: "action",
			headerName: t("customer.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("customer.table.viewCustomer", { defaultValue: "View Customer" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={VisibilityIcon}
							onClick={() => {
								// openCustomerView(params.row.id);
								navigate(`/invoice/customer/${params.row.id}`);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("customer.table.editCustomer", { defaultValue: "Edit Customer" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateCustomer(params.row);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("customer.table.deleteCustomer", { defaultValue: "Delete Customer" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: t("customer.actions.deleteTitle", { defaultValue: "Delete Customer" }),
									message: t("customer.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this customer?",
									}),
									onConfirm: async () => {
										await removeCustomer.mutateAsync({ id: params.row.id });
										queryClient.invalidateQueries({
											queryKey: getCustomerControllerFindAllQueryKey(),
										});
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

	if (CustomerData.isLoading) {
		return <Loader />;
	}

	return (
		<Box>
			<DataGrid
				autoHeight
				rows={CustomerData?.data ?? []}
				columns={columns}
				slots={{
					toolbar: CombinedToolbar,
				}}
				localeText={{
					noRowsLabel: t("table.noRows", { defaultValue: "No rows" }),
				}}
			/>
		</Box>
	);
};

export default CustomerTableList;
