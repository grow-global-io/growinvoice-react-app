import { Box, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@shared/components/Loader";
import {
	getExpensesControllerFindAllQueryKey,
	useExpensesControllerFindAll,
	useExpensesControllerRemove,
} from "@api/services/expenses";
import { useNavigate } from "react-router-dom";
import { parseDateStringToFormat } from "@shared/formatter";
import { useCreateVendorsViewStore } from "@store/createVendorViewStore";

const ExpensesTable = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const allExpenses = useExpensesControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const removeExpense = useExpensesControllerRemove();
	const { openVendorsView } = useCreateVendorsViewStore.getState();
	const handleEdit = (invoiceId: string) => {
		navigate(`/expenses/createexpenses/${invoiceId}`);
	};
	const handleView = (vendorId: string) => {
		openVendorsView(vendorId);
		navigate("/vendors/vendorslist");
	};

	const columns: GridColDef[] = [
		{
			field: "vendor",
			headerName: "Vendro Name",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Box
						sx={{ cursor: "pointer" }}
						onClick={() => {
							handleView(params?.value?.id);
						}}
					>
						<Typography variant="h6" color={"secondary"}>
							{params?.value?.name}
						</Typography>
					</Box>
				);
			},
		},

		{
			field: "category",
			headerName: "Category",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "expenseDate",
			headerName: "Date",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params.value)}</Typography>;
			},
		},
		{
			field: "notes",
			headerName: "Notes",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "amount",
			headerName: "Amount",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "action",
			headerName: "Action",
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip title="Edit expenses" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								handleEdit(params.row.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Delete expenses" key={params.row?.id}>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete Expenses",
									message: "Are you sure you want to delete this expenses?",
									onConfirm: async () => {
										await removeExpense.mutateAsync({ id: params.row.id });
										queryClient.invalidateQueries({
											queryKey: getExpensesControllerFindAllQueryKey(),
										});
									},
									onCancel: () => {
										cleanUp();
									},
									confirmButtonText: "Delete",
								});
							}}
						/>
						,
					</Box>
				</Tooltip>,
			],
		},
	];

	if (allExpenses.isLoading) {
		return <Loader />;
	}

	return (
		<Box>
			<DataGrid autoHeight rows={allExpenses?.data} columns={columns} />
		</Box>
	);
};

export default ExpensesTable;
