import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import { useReportsControllerGetCustomerReports } from "@api/services/reports";
import { useCustomerControllerFindAll } from "@api/services/customer";
import { useInvoiceControllerFindAll } from "@api/services/invoice";
import { currencyFormatter } from "@shared/formatter";
import Loader from "@shared/components/Loader";
import { useAuthStore } from "@store/auth";
import { useMemo } from "react";
import { CustomToolbar } from "@shared/components/CustomToolbar";
import { useTranslation } from "react-i18next";

const CustomerDataTableList = ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
	const { t } = useTranslation();
	const { user } = useAuthStore();

	// Fetch all customers
	const allCustomers = useCustomerControllerFindAll();

	// Fetch ALL invoices to get all customers from invoice history (including deleted ones)
	// const allInvoices = useInvoiceControllerFindAll(undefined, {
	// 	query: {
	// 		enabled: true,
	// 	},
	// });

	// Fetch invoice data for the date range (for calculating stats)
	const customerReportData = useReportsControllerGetCustomerReports(
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

	// Create a helper function to format address
	const formatAddress = (customer: any) => {
		const billingAddress = customer?.billingAddress;
		const addressParts = [];

		if (billingAddress?.address) {
			addressParts.push(billingAddress.address);
		}
		if (billingAddress?.city) {
			addressParts.push(billingAddress.city);
		}
		if (billingAddress?.state?.name) {
			addressParts.push(billingAddress.state.name);
		}
		if (billingAddress?.country?.name) {
			addressParts.push(billingAddress.country.name);
		}
		if (billingAddress?.zip) {
			addressParts.push(billingAddress.zip);
		}

		return addressParts.length > 0 ? addressParts.join(", ") : "-";
	};

	// Create a map of invoice statistics by customer ID for the date range
	// Also collect all customers from invoices (including deleted ones)
	const invoiceStatsByCustomer = useMemo(() => {
		const statsMap = new Map<
			string,
			{
				totalInvoices: number;
				totalAmount: number;
				customer: any; // Store customer data from invoices
			}
		>();

		if (customerReportData?.data && customerReportData.data.length > 0) {
			customerReportData.data.forEach((invoice: any) => {
				const customerId = invoice.customer?.id || invoice.customer_id;
				if (!customerId) return;

				if (!statsMap.has(customerId)) {
					statsMap.set(customerId, {
						totalInvoices: 0,
						totalAmount: 0,
						customer: invoice.customer, // Store customer data from invoice
					});
				}

				const stats = statsMap.get(customerId)!;
				stats.totalInvoices += 1;
				stats.totalAmount += invoice.total || 0;
				// Update customer data if invoice has more complete customer info
				if (invoice.customer && !stats.customer) {
					stats.customer = invoice.customer;
				}
			});
		}

		return statsMap;
	}, [customerReportData?.data]);

	// Transform all customers with their invoice statistics for the date range
	// Include both customers from customer list AND customers from invoice history (even deleted ones)
	const customerDataRows = useMemo(() => {
		const customerMap = new Map<string, any>();

		// First, add all customers from the customer list
		if (allCustomers?.data && allCustomers.data.length > 0) {
			allCustomers.data.forEach((customer: any) => {
				customerMap.set(customer.id, customer);
			});
		}

		// Then, add customers from invoice history (including deleted ones)
		invoiceStatsByCustomer.forEach((stats, customerId) => {
			if (stats.customer && !customerMap.has(customerId)) {
				// This customer is from invoice history but not in customer list (likely deleted)
				customerMap.set(customerId, stats.customer);
			}
		});

		// Convert map to array and format for DataGrid
		return Array.from(customerMap.values()).map((customer: any) => {
			const customerId = customer.id;
			const stats = invoiceStatsByCustomer.get(customerId) || {
				totalInvoices: 0,
				totalAmount: 0,
			};

			return {
				id: customerId,
				customer_id: customerId,
				customerName: customer?.name || "-",
				email: customer?.email || "-",
				phone: customer?.phone || "-",
				address: formatAddress(customer),
				totalInvoices: stats.totalInvoices,
				totalAmount: stats.totalAmount,
			};
		});
	}, [allCustomers?.data, invoiceStatsByCustomer]);

	const CustomerDataMap = useMemo(() => {
		return customerDataRows.map((item) => {
			return {
				CustomerName: item.customerName,
				Email: item.email,
				Phone: item.phone,
				Address: item.address,
				TotalInvoices: item.totalInvoices,
				TotalAmount: item.totalAmount,
			};
		});
	}, [customerDataRows]);

	const columns: GridColDef[] = [
		{
			field: "customerName",
			headerName: t("report.customerData.customerName", { defaultValue: "Customer Name" }),
			flex: 1,
			minWidth: 180,
			renderCell: (params) => {
				return (
					<Typography
						sx={{
							color: "primary.main",
							fontWeight: "bold",
						}}
					>
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "email",
			headerName: t("report.customerData.email", { defaultValue: "Email" }),
			flex: 1,
			minWidth: 200,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "phone",
			headerName: t("report.customerData.phone", { defaultValue: "Phone Number" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "address",
			headerName: t("report.customerData.address", { defaultValue: "Address" }),
			flex: 1.5,
			minWidth: 250,
			renderCell: (params) => {
				return (
					<Typography
						sx={{
							whiteSpace: "normal",
							wordBreak: "break-word",
						}}
					>
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "totalInvoices",
			headerName: t("report.customerData.totalInvoices", { defaultValue: "Total Invoices" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography
						sx={{
							fontWeight: "bold",
							color: "primary.main",
						}}
					>
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "totalAmount",
			headerName: t("report.customerData.totalAmount", { defaultValue: "Total Amount" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography
						sx={{
							fontWeight: "bold",
							color: "success.main",
						}}
					>
						{currencyFormatter(params.value, user?.currency?.short_code)}
					</Typography>
				);
			},
		},
	];

	if (
		allCustomers?.isLoading ||
		allCustomers?.isFetching ||
		(customerReportData?.isLoading && !!fromDate && !!toDate) ||
		(customerReportData?.isFetching && !!fromDate && !!toDate)
	) {
		return <Loader />;
	}

	return (
		<Box>
			<DataGrid
				autoHeight
				rows={customerDataRows}
				columns={columns}
				getRowId={(row) => row.id}
				slots={{
					toolbar: () => {
						return <CustomToolbar rows={CustomerDataMap ?? []} />;
					},
				}}
			/>
		</Box>
	);
};

export default CustomerDataTableList;
