import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Chip, Tooltip, Typography } from "@mui/material";
import { Constants } from "@shared/constants";
import { useInvoiceControllerFindAll } from "@api/services/invoice";
import Loader from "@shared/components/Loader";
import { Invoice } from "@api/services/models";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import { useAuthStore } from "@store/auth";
import EditIcon from "@mui/icons-material/Edit";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import { useConfirmDialogStore } from "@store/confirmDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useInvoiceHook } from "./invoiceHooks/useInvoiceHook";

const InvoiceTableAllList = () => {
	const { user } = useAuthStore();
	const invoiceData = useInvoiceControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();

	const { handleDelete, handleEdit, handleView } = useInvoiceHook();

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
				return <Typography>{parseDateStringToFormat(params.value)}</Typography>;
			},
		},
		{
			field: "due_date",
			headerName: "Due Date",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params.value)}</Typography>;
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
						label={params.value}
						color={Constants?.invoiceStatusColorEnums[params.value] ?? "default"}
						variant="filled"
					/>
				);
			},
		},
		{
			field: "due_amount",
			headerName: "Due Amount",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>{currencyFormatter(params.value, user?.currency?.short_code)}</Typography>
				);
			},
		},
		{
			field: "paid_amount",
			headerName: "Paid Amount",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>{currencyFormatter(params?.value, user?.currency?.short_code)}</Typography>
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
						label={params.value}
						color={Constants?.invoiceStatusColorEnums[params.value] ?? "default"}
						variant="filled"
					/>
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
					<Typography>{currencyFormatter(params.value, user?.currency?.short_code)}</Typography>
				);
			},
		},

		{
			field: "action",
			headerName: "Action",
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip title="View Invoice" key={params.row?.id}>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleView(params.row.id);
							}}
							src={VisibilityIcon}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Edit Invoice" key={params.row?.id}>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleEdit(params.row.id);
							}}
							src={EditIcon}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Delete Invoice" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete Invoice",
									message: "Are you sure you want to delete this invoice?",
									onConfirm: async () => {
										await handleDelete(params.row.id);
									},
									onCancel: () => {
										cleanUp();
									},
									confirmButtonText: "Delete",
								});
							}}
						/>
					</Box>
				</Tooltip>,
			],
		},
	];

	if (invoiceData.isLoading) return <Loader />;

	return (
		<Box>
			<DataGrid autoHeight rows={invoiceData?.data ?? []} columns={columns} />
		</Box>
	);
};

export default InvoiceTableAllList;
