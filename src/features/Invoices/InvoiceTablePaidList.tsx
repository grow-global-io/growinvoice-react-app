import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Chip, Typography } from "@mui/material";
import { Constants } from "@shared/constants";
import { useInvoiceControllerFindPaidInvoices } from "@api/services/invoice";
import Loader from "@shared/components/Loader";
import { Invoice } from "@api/services/models";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import { useAuthStore } from "@store/auth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import { useInvoiceHook } from "./invoiceHooks/useInvoiceHook";

const InvoiceTablePaidList = () => {
	const { user } = useAuthStore();
	const invoiceData = useInvoiceControllerFindPaidInvoices();
	const { handleView } = useInvoiceHook();

	const columns: GridColDef<Invoice>[] = [
		{
			field: "invoice_number",
			headerName: "Invoice Number",
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
			field: "date",
			headerName: "Invoice Date",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params?.value)}</Typography>;
			},
		},
		{
			field: "due_date",
			headerName: "Due Date",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params?.value)}</Typography>;
			},
		},
		{
			field: "status",
			headerName: "Status",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Chip
						label={params?.value}
						color={Constants?.invoiceStatusColorEnums[params?.value] ?? "default"}
						variant="filled"
					/>
				);
			},
		},
		{
			field: "paid_status",
			headerName: "Paid Status",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Chip
						label={params?.value}
						color={Constants?.invoiceStatusColorEnums[params?.value] ?? "default"}
						variant="filled"
					/>
				);
			},
		},
		{
			field: "paid_amount",

			headerName: "Total Paid Amount",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>{currencyFormatter(params.value, user?.currency?.short_code)}</Typography>
				);
			},
		},
		{
			field: "total",
			headerName: "Total",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>{currencyFormatter(params?.value, user?.currency?.short_code)}</Typography>
				);
			},
		},

		{
			field: "action",
			headerName: "Action",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => (
				<CustomIconButton
					src={VisibilityIcon}
					onClick={() => {
						handleView(params?.row?.id);
					}}
				/>
			),
		},
	];

	if (invoiceData.isLoading) return <Loader />;

	return (
		<Box>
			<DataGrid autoHeight rows={invoiceData?.data ?? []} columns={columns} />
		</Box>
	);
};

export default InvoiceTablePaidList;
