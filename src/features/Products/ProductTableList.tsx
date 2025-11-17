import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useCreateProductStore } from "@store/createProductStore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { type ProductWithAllDataDto } from "@api/services/models";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useDialog } from "@shared/hooks/useDialog";
import ProductDialog from "@features/Store/ProductDialog";

const ProductTableList = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { updateProduct } = useCreateProductStore.getState();
	const productList = useProductControllerFindAll();
	const removeProduct = useProductControllerRemove();

	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const { handleClickOpen, handleClose, open } = useDialog();
	const [selectedProduct, setSelectedProduct] = useState<ProductWithAllDataDto | undefined>(
		undefined,
	);

	const columns: GridColDef<ProductWithAllDataDto>[] = [
		{
			field: "name",
			headerName: t("product.table.product", { defaultValue: "Product" }),
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
			headerName: t("product.table.unit", { defaultValue: "Unit" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const unitName = params?.row?.unit?.name;
				const translatedUnit = unitName
					? t(`product.units.${unitName.toLowerCase()}`, { defaultValue: unitName })
					: unitName;
				return <Typography textTransform={"capitalize"}>{translatedUnit}</Typography>;
			},
		},
		{
			field: "productType",
			headerName: t("product.table.productType", { defaultValue: "Product Type" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const productType = params.row.type;
				const translatedType = productType
					? t(`product.type.${productType.toLowerCase()}`, { defaultValue: productType })
					: productType;
				return <Typography>{translatedType}</Typography>;
			},
		},
		{
			field: "createdAt",
			headerName: t("product.table.createdAt", { defaultValue: "Created At" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{timeAgo(params.value, t)}</Typography>;
			},
		},
		{
			field: "action",
			headerName: t("product.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("product.table.viewProduct", { defaultValue: "View Product" })}
					key={`view-${params.row?.id}`}
				>
					<Box>
						<CustomIconButton
							src={VisibilityIcon}
							onClick={() => {
								setSelectedProduct(params.row);
								handleClickOpen();
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("product.table.editProduct", { defaultValue: "Edit Product" })}
					key={`edit-${params.row?.id}`}
				>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateProduct(params.row);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("product.table.deleteProduct", { defaultValue: "Delete Product" })}
					key={`delete-${params.row?.id}`}
				>
					<Box>
						<CustomIconButton
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: t("product.actions.deleteTitle", { defaultValue: "Delete Product" }),
									message: t("product.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this product?",
									}),
									onConfirm: async () => {
										await removeProduct.mutateAsync({ id: params.row.id });
										queryClient.invalidateQueries({
											queryKey: getProductControllerFindAllQueryKey(),
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

	if (productList.isLoading || productList.isRefetching || productList.isFetching)
		return <Loader />;
	return (
		<Box>
			<DataGrid autoHeight rows={productList?.data} columns={columns} />
			<ProductDialog product={selectedProduct} handleClose={handleClose} open={open} />
		</Box>
	);
};

export default ProductTableList;
