import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Chip, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useQuotationControllerFindAll } from "@api/services/quotation";
import { useAuthStore } from "@store/auth";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import { Quotation } from "@api/services/models";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import Loader from "@shared/components/Loader";
import { useQuotationHook } from "./QuotationHooks/useQuotationHook";
import { Constants } from "@shared/constants";

const QuotationTableList = () => {
	const { user } = useAuthStore();
	const quationdata = useQuotationControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const { handleDelete, handleEdit, handleView } = useQuotationHook();
	const columns: GridColDef<Quotation>[] = [
		{
			field: "quatation_number",
			headerName: "Quation Number",
			flex: 1,
			minWidth: 150,

			renderCell: (params) => {
				return (
					<Typography variant="h6" color={"secondary"}>
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "date",
			headerName: "Quotaion Date",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params.value)}</Typography>;
			},
		},
		{
			field: "expiry_at",
			headerName: "Expiry AT",
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
						color={Constants?.invoiceStatusColorEnums[params?.value] ?? "default"}
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
				<Tooltip title="View Quotation" key={params.row?.id}>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleView(params.row.id);
							}}
							src={VisibilityIcon}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Edit Quotation" key={params.row?.id}>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleEdit(params.row.id);
							}}
							src={EditIcon}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Delete Quotation" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete Quotation",
									message: "Are you sure you want to delete this quotation?",
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

	if (quationdata.isLoading) return <Loader />;

	return (
		<Box>
			<DataGrid autoHeight rows={quationdata?.data} columns={columns} />
		</Box>
	);
};

export default QuotationTableList;
