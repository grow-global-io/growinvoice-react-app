import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Tooltip, Typography } from "@mui/material";
import {
	getProductControllerFindAllQueryKey,
	useProductControllerFindAll,
	useProductControllerRemove,
} from "@api/services/product";
import Loader from "@shared/components/Loader";
import { timeAgo } from "@shared/formatter";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import { useCreateProductStore } from "@store/createProductStore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { ProductWithAllDataDto } from "@api/services/models";

const ProductTableList = () => {
	const queryClient = useQueryClient();
	const { updateProduct } = useCreateProductStore.getState();
	const productList = useProductControllerFindAll();
	const removeProduct = useProductControllerRemove();

	const { handleOpen, cleanUp } = useConfirmDialogStore();

	const columns: GridColDef<ProductWithAllDataDto>[] = [
		{
			field: "name",
			headerName: "Product",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography variant="h6" color="secondary">
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "unit",
			headerName: "Unit",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography textTransform={"capitalize"}>{params?.row?.unit?.name}</Typography>;
			},
		},
		{
			field: "productType",
			headerName: "Product Type",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.row.type}</Typography>;
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
				<Tooltip title="Edit Product" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateProduct(params.row);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Delete Product" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete Product",
									message: "Are you sure you want to delete this product?",
									onConfirm: async () => {
										await removeProduct.mutateAsync({ id: params.row.id });
										queryClient.invalidateQueries({
											queryKey: getProductControllerFindAllQueryKey(),
										});
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

	if (productList.isLoading || productList.isRefetching || productList.isFetching)
		return <Loader />;
	return (
		<Box>
			<DataGrid autoHeight rows={productList?.data} columns={columns} />
		</Box>
	);
};

export default ProductTableList;
