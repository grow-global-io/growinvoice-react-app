import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	getProductunitControllerFindAllQueryKey,
	useProductunitControllerFindAll,
	useProductunitControllerRemove,
} from "@api/services/productunit";
import Loader from "@shared/components/Loader";
import { Box, Tooltip } from "@mui/material";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateProductUnitStore } from "@store/createProductUnitStore";

const ProductUnitTableList = () => {
	const queryClient = useQueryClient();
	const allProductUnit = useProductunitControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const removeProductUnit = useProductunitControllerRemove();
	const { updateProductUnit } = useCreateProductUnitStore.getState();
	const columns: GridColDef[] = [
		{
			field: "name",
			headerName: "Name",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "action",
			headerName: "Action",
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip title="Edit Product Unit" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateProductUnit(params.row?.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Delete Product Unit" key={params.row?.id}>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete Product Unit",
									message: "Are you sure you want to delete this Product Unit?",
									onConfirm: async () => {
										await removeProductUnit.mutateAsync({ id: params.row.id });

										await queryClient.refetchQueries({
											queryKey: getProductunitControllerFindAllQueryKey(),
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
	if (allProductUnit?.isLoading || allProductUnit.isFetching) {
		return <Loader />;
	}
	return (
		<DataGrid
			autoHeight
			rows={allProductUnit?.data}
			columns={columns}
			sx={{
				width: {
					sm: "100%",
					md: "100%",
					lg: "99%",
				},
			}}
		/>
	);
};

export default ProductUnitTableList;
