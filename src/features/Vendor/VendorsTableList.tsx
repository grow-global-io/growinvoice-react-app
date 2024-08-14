import { Box, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import {
	getVendorsControllerFindAllQueryKey,
	useVendorsControllerFindAll,
	useVendorsControllerRemove,
} from "@api/services/vendors";
import { timeAgo } from "@shared/formatter";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@shared/components/Loader";
import { useCreateVendorsStore } from "@store/createVendorsStore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useCreateVendorsViewStore } from "@store/createVendorViewStore";

const VendorsTableList = () => {
	const queryClient = useQueryClient();
	const allvendors = useVendorsControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const { updateVendors } = useCreateVendorsStore.getState();
	const removeVendors = useVendorsControllerRemove();
	const { openVendorsView } = useCreateVendorsViewStore.getState();

	const columns: GridColDef[] = [
		{
			field: "display_name",
			headerName: "Display Name",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography variant="body1" color="secondary">
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "name",
			headerName: "Contact Name",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "createdAt",
			headerName: "Created At",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{timeAgo(params.value)}</Typography>;
			},
		},
		{
			field: "action",
			headerName: "Action",
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip title="View Vendor" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={VisibilityIcon}
							onClick={() => {
								openVendorsView(params.row.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Edit Vendor" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateVendors(params.row?.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Delete Vendor" key={params.row?.id}>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete Vendor",
									message: "Are you sure you want to delete this vedor?",
									onConfirm: async () => {
										await removeVendors.mutateAsync({ id: params.row.id });
										queryClient.invalidateQueries({
											queryKey: getVendorsControllerFindAllQueryKey(),
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

	if (allvendors.isLoading) {
		return <Loader />;
	}

	return (
		<Box>
			<DataGrid autoHeight rows={allvendors?.data} columns={columns} />
			{/* <VendorViewDialog  open={open} handleClose={handleClose} vendorId={viewVendorId ?? ""} /> */}
		</Box>
	);
};

export default VendorsTableList;
